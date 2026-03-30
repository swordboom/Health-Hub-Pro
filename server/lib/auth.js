import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const JWT_SECRET_PLACEHOLDER = "replace-this-with-a-long-random-string";

function getTokenSecret() {
  const configuredSecret = String(process.env.JWT_SECRET ?? "").trim();

  if (!configuredSecret || configuredSecret === JWT_SECRET_PLACEHOLDER || configuredSecret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with a strong random value (at least 32 characters). Update your .env before starting the server.",
    );
  }

  return configuredSecret;
}

const TOKEN_SECRET = getTokenSecret();

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function signValue(value) {
  return createHmac("sha256", TOKEN_SECRET).update(value).digest("base64url");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = String(passwordHash || "").split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (derivedKey.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedBuffer);
}

export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt,
  };
}

export function createAuthToken(user) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  return `${unsignedToken}.${signValue(unsignedToken)}`;
}

export function verifyAuthToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  if (signature !== signValue(unsignedToken)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    response.status(401).json({ error: "Your session has expired. Please sign in again." });
    return;
  }

  request.auth = payload;
  next();
}
