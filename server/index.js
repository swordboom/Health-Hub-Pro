import path from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import express from "express";
import { ensureDatabase, readDatabase, updateDatabase } from "./lib/database.js";
import { analyzeSideEffectsWithGrok, analyzeSymptomsWithGrok } from "./lib/grok.js";
import { createAuthToken, hashPassword, requireAuth, toPublicUser, verifyPassword } from "./lib/auth.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const clientDistPath = path.resolve(process.cwd(), "dist");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanOptionalText(value) {
  const normalized = cleanText(value);
  return normalized || null;
}

function cleanEmail(value) {
  return cleanText(value).toLowerCase();
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => cleanText(item))
      .filter(Boolean);
  }

  return [];
}

function toIsoString(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `Please provide a valid ${fieldName}.`);
  }

  return date.toISOString();
}

function formatProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
    chronicConditions: Array.isArray(profile.chronicConditions) ? profile.chronicConditions : [],
  };
}

function getUserRecord(database, userId) {
  return database.users.find((user) => user.id === userId) || null;
}

function listAppointments(database, userId) {
  return database.appointments
    .filter((appointment) => appointment.userId === userId)
    .sort((left, right) => new Date(left.appointmentDate).getTime() - new Date(right.appointmentDate).getTime());
}

function listMedicineReminders(database, userId) {
  return database.medicineReminders
    .filter((reminder) => reminder.userId === userId && reminder.isActive)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

function listTestSchedules(database, userId) {
  return database.testSchedules
    .filter((testSchedule) => testSchedule.userId === userId)
    .sort((left, right) => new Date(left.scheduledDate).getTime() - new Date(right.scheduledDate).getTime());
}

app.use(express.json({ limit: "1mb" }));
app.use((request, response, next) => {
  const origin = request.headers.origin;

  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post(
  "/api/auth/signup",
  asyncHandler(async (request, response) => {
    const email = cleanEmail(request.body.email);
    const password = cleanText(request.body.password);
    const fullName = cleanText(request.body.fullName);

    if (!email || !email.includes("@")) {
      throw new HttpError(400, "Please enter a valid email address.");
    }

    if (password.length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters long.");
    }

    if (!fullName) {
      throw new HttpError(400, "Full name is required.");
    }

    const user = await updateDatabase((database) => {
      const existingUser = database.users.find((entry) => entry.email === email);
      if (existingUser) {
        throw new HttpError(409, "An account with this email already exists.");
      }

      const nextUser = {
        id: randomUUID(),
        email,
        fullName,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };

      database.users.push(nextUser);
      return nextUser;
    });

    response.status(201).json({
      token: createAuthToken(user),
      user: toPublicUser(user),
    });
  }),
);

app.post(
  "/api/auth/login",
  asyncHandler(async (request, response) => {
    const email = cleanEmail(request.body.email);
    const password = cleanText(request.body.password);
    const database = await readDatabase();
    const user = database.users.find((entry) => entry.email === email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, "Invalid email or password.");
    }

    response.json({
      token: createAuthToken(user),
      user: toPublicUser(user),
    });
  }),
);

app.get(
  "/api/auth/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    const database = await readDatabase();
    const user = getUserRecord(database, request.auth.sub);

    if (!user) {
      throw new HttpError(401, "Your account could not be found.");
    }

    response.json({ user: toPublicUser(user) });
  }),
);

app.get(
  "/api/profile",
  requireAuth,
  asyncHandler(async (request, response) => {
    const database = await readDatabase();
    const profile = database.healthProfiles.find((entry) => entry.userId === request.auth.sub) || null;

    response.json({ profile: formatProfile(profile) });
  }),
);

app.post(
  "/api/profile",
  requireAuth,
  asyncHandler(async (request, response) => {
    const fullName = cleanText(request.body.fullName);

    if (!fullName) {
      throw new HttpError(400, "Full name is required.");
    }

    const savedProfile = await updateDatabase((database) => {
      const now = new Date().toISOString();
      const profileIndex = database.healthProfiles.findIndex((entry) => entry.userId === request.auth.sub);
      const existingProfile = profileIndex >= 0 ? database.healthProfiles[profileIndex] : null;
      const profile = {
        id: existingProfile?.id || randomUUID(),
        userId: request.auth.sub,
        fullName,
        dateOfBirth: cleanOptionalText(request.body.dateOfBirth),
        gender: cleanOptionalText(request.body.gender),
        bloodType: cleanOptionalText(request.body.bloodType),
        heightCm: toNumberOrNull(request.body.heightCm),
        weightKg: toNumberOrNull(request.body.weightKg),
        allergies: toStringArray(request.body.allergies),
        chronicConditions: toStringArray(request.body.chronicConditions),
        emergencyContactName: cleanOptionalText(request.body.emergencyContactName),
        emergencyContactPhone: cleanOptionalText(request.body.emergencyContactPhone),
        createdAt: existingProfile?.createdAt || now,
        updatedAt: now,
      };

      if (profileIndex >= 0) {
        database.healthProfiles[profileIndex] = profile;
      } else {
        database.healthProfiles.push(profile);
      }

      const user = database.users.find((entry) => entry.id === request.auth.sub);
      if (user) {
        user.fullName = fullName;
      }

      return profile;
    });

    response.status(201).json({ profile: formatProfile(savedProfile) });
  }),
);

app.get(
  "/api/dashboard",
  requireAuth,
  asyncHandler(async (request, response) => {
    const database = await readDatabase();
    const now = Date.now();
    const profile = database.healthProfiles.find((entry) => entry.userId === request.auth.sub) || null;
    const appointments = listAppointments(database, request.auth.sub)
      .filter((appointment) => appointment.status === "scheduled" && new Date(appointment.appointmentDate).getTime() >= now)
      .slice(0, 3);
    const medicineReminders = listMedicineReminders(database, request.auth.sub).slice(0, 5);
    const testSchedules = listTestSchedules(database, request.auth.sub)
      .filter((testSchedule) => testSchedule.status === "scheduled" && new Date(testSchedule.scheduledDate).getTime() >= now)
      .slice(0, 3);

    response.json({
      profile: formatProfile(profile),
      appointments,
      medicineReminders,
      testSchedules,
    });
  }),
);

app.get(
  "/api/appointments",
  requireAuth,
  asyncHandler(async (request, response) => {
    const database = await readDatabase();
    response.json({ appointments: listAppointments(database, request.auth.sub) });
  }),
);

app.post(
  "/api/appointments",
  requireAuth,
  asyncHandler(async (request, response) => {
    const doctorName = cleanText(request.body.doctorName);

    if (!doctorName) {
      throw new HttpError(400, "Doctor name is required.");
    }

    const appointmentDate = toIsoString(request.body.appointmentDate, "appointment date");
    const appointment = await updateDatabase((database) => {
      const nextAppointment = {
        id: randomUUID(),
        userId: request.auth.sub,
        doctorName,
        doctorSpecialty: cleanOptionalText(request.body.doctorSpecialty),
        hospitalName: cleanOptionalText(request.body.hospitalName),
        appointmentDate,
        appointmentType: cleanOptionalText(request.body.appointmentType) || "checkup",
        notes: cleanOptionalText(request.body.notes),
        status: cleanOptionalText(request.body.status) || "scheduled",
        createdAt: new Date().toISOString(),
      };

      database.appointments.push(nextAppointment);
      return nextAppointment;
    });

    response.status(201).json({ appointment });
  }),
);

app.get(
  "/api/medicine-reminders",
  requireAuth,
  asyncHandler(async (request, response) => {
    const database = await readDatabase();
    response.json({ medicineReminders: listMedicineReminders(database, request.auth.sub) });
  }),
);

app.post(
  "/api/medicine-reminders",
  requireAuth,
  asyncHandler(async (request, response) => {
    const medicineName = cleanText(request.body.medicineName);
    const dosage = cleanText(request.body.dosage);
    const timeOfDay = toStringArray(request.body.timeOfDay);

    if (!medicineName || !dosage || timeOfDay.length === 0) {
      throw new HttpError(400, "Medicine name, dosage, and at least one time of day are required.");
    }

    const medicineReminder = await updateDatabase((database) => {
      const nextReminder = {
        id: randomUUID(),
        userId: request.auth.sub,
        medicineName,
        dosage,
        frequency: cleanOptionalText(request.body.frequency) || "daily",
        timeOfDay,
        startDate: cleanOptionalText(request.body.startDate) || new Date().toISOString().slice(0, 10),
        endDate: cleanOptionalText(request.body.endDate),
        notes: cleanOptionalText(request.body.notes),
        isActive: request.body.isActive ?? true,
        createdAt: new Date().toISOString(),
      };

      database.medicineReminders.push(nextReminder);
      return nextReminder;
    });

    response.status(201).json({ medicineReminder });
  }),
);

app.get(
  "/api/test-schedules",
  requireAuth,
  asyncHandler(async (request, response) => {
    const database = await readDatabase();
    response.json({ testSchedules: listTestSchedules(database, request.auth.sub) });
  }),
);

app.post(
  "/api/test-schedules",
  requireAuth,
  asyncHandler(async (request, response) => {
    const testName = cleanText(request.body.testName);

    if (!testName) {
      throw new HttpError(400, "Test name is required.");
    }

    const scheduledDate = toIsoString(request.body.scheduledDate, "scheduled date");
    const testSchedule = await updateDatabase((database) => {
      const nextTestSchedule = {
        id: randomUUID(),
        userId: request.auth.sub,
        testName,
        labName: cleanOptionalText(request.body.labName),
        scheduledDate,
        instructions: cleanOptionalText(request.body.instructions),
        status: cleanOptionalText(request.body.status) || "scheduled",
        createdAt: new Date().toISOString(),
      };

      database.testSchedules.push(nextTestSchedule);
      return nextTestSchedule;
    });

    response.status(201).json({ testSchedule });
  }),
);

app.post(
  "/api/symptoms/analyze",
  requireAuth,
  asyncHandler(async (request, response) => {
    const symptoms = toStringArray(request.body.symptoms);
    if (symptoms.length === 0) {
      throw new HttpError(400, "Please select at least one symptom.");
    }

    const result = await analyzeSymptomsWithGrok(symptoms);

    await updateDatabase((database) => {
      database.symptomChecks.push({
        id: randomUUID(),
        userId: request.auth.sub,
        symptoms,
        detectedDisease: result.possibleConditions[0]?.name || null,
        suggestedMedicines: result.suggestedMedicines.map((medicine) => medicine.name),
        suggestedDoctorType: result.doctorType,
        aiResponse: result,
        createdAt: new Date().toISOString(),
      });
    });

    response.json(result);
  }),
);

app.post(
  "/api/symptoms/side-effects",
  requireAuth,
  asyncHandler(async (request, response) => {
    const medicineName = cleanText(request.body.medicineName);
    if (!medicineName) {
      throw new HttpError(400, "Please enter a medicine name.");
    }

    const result = await analyzeSideEffectsWithGrok(medicineName);
    response.json(result);
  }),
);

app.use((error, _request, response, _next) => {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unexpected server error.";

  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({ error: message });
});

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(clientDistPath, "index.html"));
  });
}

await ensureDatabase();

app.listen(port, () => {
  console.log(`Health Hub API running on http://localhost:${port}`);
});
