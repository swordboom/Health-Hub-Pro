import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const defaultDatabase = {
  users: [],
  healthProfiles: [],
  appointments: [],
  medicineReminders: [],
  testSchedules: [],
  symptomChecks: [],
};

const dataFilePath = path.resolve(process.cwd(), process.env.DATA_FILE || "server/data/db.json");
let writeQueue = Promise.resolve();

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

export async function ensureDatabase() {
  const directory = path.dirname(dataFilePath);
  await mkdir(directory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    await writeFile(dataFilePath, JSON.stringify(createDefaultDatabase(), null, 2));
  }
}

export async function readDatabase() {
  await ensureDatabase();

  const raw = await readFile(dataFilePath, "utf8");
  if (!raw.trim()) {
    return createDefaultDatabase();
  }

  return normalizeDatabase(JSON.parse(raw));
}

export async function updateDatabase(updater) {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const database = await readDatabase();
      const result = await updater(database);

      await writeFile(dataFilePath, JSON.stringify(database, null, 2));

      return result;
    });

  return writeQueue;
}
