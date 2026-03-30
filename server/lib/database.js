import path from "node:path";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const defaultDatabase = {
  users: [],
  healthProfiles: [],
  appointments: [],
  medicineReminders: [],
  testSchedules: [],
  symptomChecks: [],
};

const legacyDataFilePath = path.resolve(process.cwd(), process.env.DATA_FILE || "server/data/db.json");
const configuredDatabaseUrl = String(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "").trim();
const databaseUrl = configuredDatabaseUrl || "file:./server/data/healthhub.db";
const databaseAuthToken = String(process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || "").trim();

if (process.env.VERCEL === "1" && !configuredDatabaseUrl) {
  throw new Error("TURSO_DATABASE_URL (or DATABASE_URL) must be configured in Vercel environment variables.");
}

let client = null;
let initPromise = null;
let writeQueue = Promise.resolve();

function getClient() {
  if (!client) {
    client = createClient({
      url: databaseUrl,
      authToken: databaseAuthToken || undefined,
    });
  }

  return client;
}

function createDefaultDatabase() {
  return JSON.parse(JSON.stringify(defaultDatabase));
}

function normalizeCollection(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeDatabase(database = {}) {
  const defaults = createDefaultDatabase();

  return {
    ...defaults,
    ...database,
    users: normalizeCollection(database.users),
    healthProfiles: normalizeCollection(database.healthProfiles),
    appointments: normalizeCollection(database.appointments),
    medicineReminders: normalizeCollection(database.medicineReminders),
    testSchedules: normalizeCollection(database.testSchedules),
    symptomChecks: normalizeCollection(database.symptomChecks),
  };
}

function getRowValue(row, key, fallback = null) {
  if (!row) {
    return fallback;
  }

  if (Object.prototype.hasOwnProperty.call(row, key)) {
    return row[key];
  }

  return fallback;
}

async function seedFromLegacyJsonIfAvailable() {
  try {
    const raw = await readFile(legacyDataFilePath, "utf8");
    const parsed = raw.trim() ? JSON.parse(raw) : createDefaultDatabase();
    return normalizeDatabase(parsed);
  } catch {
    return createDefaultDatabase();
  }
}

async function ensureStateRow() {
  const db = getClient();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await db.execute("SELECT id FROM app_state WHERE id = 1 LIMIT 1");
  if (existing.rows.length > 0) {
    return;
  }

  const initialData = await seedFromLegacyJsonIfAvailable();
  await db.execute({
    sql: "INSERT INTO app_state (id, data, revision, updated_at) VALUES (1, ?, 0, CURRENT_TIMESTAMP)",
    args: [JSON.stringify(initialData)],
  });
}

async function readState() {
  await ensureDatabase();
  const db = getClient();
  const result = await db.execute("SELECT data, revision FROM app_state WHERE id = 1 LIMIT 1");
  const row = result.rows[0];

  if (!row) {
    const fallback = createDefaultDatabase();
    return { database: fallback, revision: 0 };
  }

  const rawData = String(getRowValue(row, "data", "{}"));
  const revision = Number(getRowValue(row, "revision", 0)) || 0;
  const parsed = rawData.trim() ? JSON.parse(rawData) : {};

  return {
    database: normalizeDatabase(parsed),
    revision,
  };
}

async function tryWriteState(database, previousRevision) {
  const db = getClient();
  const nextRevision = previousRevision + 1;
  const result = await db.execute({
    sql: `
      UPDATE app_state
      SET data = ?, revision = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1 AND revision = ?
    `,
    args: [JSON.stringify(database), nextRevision, previousRevision],
  });

  return result.rowsAffected === 1;
}

export async function ensureDatabase() {
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = ensureStateRow().finally(() => {
    initPromise = null;
  });

  await initPromise;
}

export async function readDatabase() {
  const { database } = await readState();
  return database;
}

export async function updateDatabase(updater) {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { database, revision } = await readState();
        const result = await updater(database);
        const saved = await tryWriteState(database, revision);

        if (saved) {
          return result;
        }
      }

      throw new Error("Database update conflict. Please retry the request.");
    });

  return writeQueue;
}
