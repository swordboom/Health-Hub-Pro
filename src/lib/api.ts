export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface HealthProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  allergies: string[];
  chronicConditions: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  doctorSpecialty: string | null;
  hospitalName: string | null;
  appointmentDate: string;
  appointmentType: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

export interface MedicineReminder {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: string;
  endDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface TestSchedule {
  id: string;
  userId: string;
  testName: string;
  labName: string | null;
  scheduledDate: string;
  instructions: string | null;
  status: string;
  createdAt: string;
}

export interface SymptomResult {
  possibleConditions: Array<{
    name: string;
    probability: "high" | "medium" | "low";
    description: string;
  }>;
  suggestedMedicines: Array<{
    name: string;
    dosage: string;
    purpose: string;
    warning?: string;
  }>;
  doctorType: string;
  generalAdvice: string[];
  urgencyLevel: "immediate" | "soon" | "routine";
  disclaimer: string;
}

export interface SideEffectResult {
  commonSideEffects: Array<{
    effect: string;
    description: string;
    severity: "mild" | "moderate" | "severe";
  }>;
  seriousSideEffects: Array<{
    effect: string;
    description: string;
    whenToSeekHelp: string;
  }>;
  drugInteractions: Array<{
    drug: string;
    interaction: string;
  }>;
  precautions: string[];
  disclaimer: string;
}

export interface SymptomCheck {
  id: string;
  userId: string;
  symptoms: string[];
  detectedDisease: string | null;
  suggestedMedicines: string[];
  suggestedDoctorType: string;
  aiResponse: SymptomResult;
  createdAt: string;
}

class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const AUTH_TOKEN_KEY = "healthhub.auth.token";

function createUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function parseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = authStorage.getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(createUrl(path), {
    ...init,
    headers,
  });

  const raw = await response.text();
  const payload = raw ? parseJson(raw) : null;

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String(payload.error)
        : response.statusText || "Request failed";

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const authStorage = {
  getToken() {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setToken(token: string) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clearToken() {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

export const api = {
  auth: {
    signUp(payload: { email: string; password: string; fullName: string }) {
      return request<{ token: string; user: AuthUser }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    signIn(payload: { email: string; password: string }) {
      return request<{ token: string; user: AuthUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    me() {
      return request<{ user: AuthUser }>("/auth/me");
    },
  },
  profile: {
    get() {
      return request<{ profile: HealthProfile | null }>("/profile");
    },
    save(payload: {
      fullName: string;
      dateOfBirth: string;
      gender: string;
      bloodType: string;
      heightCm: string;
      weightKg: string;
      allergies: string[];
      chronicConditions: string[];
      emergencyContactName: string;
      emergencyContactPhone: string;
    }) {
      return request<{ profile: HealthProfile }>("/profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  dashboard: {
    getSummary() {
      return request<{
        profile: HealthProfile | null;
        appointments: Appointment[];
        medicineReminders: MedicineReminder[];
        testSchedules: TestSchedule[];
      }>("/dashboard");
    },
  },
  appointments: {
    list() {
      return request<{ appointments: Appointment[] }>("/appointments");
    },
    create(payload: {
      doctorName: string;
      doctorSpecialty: string;
      hospitalName: string;
      appointmentDate: string;
      notes: string;
    }) {
      return request<{ appointment: Appointment }>("/appointments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  medicineReminders: {
    list() {
      return request<{ medicineReminders: MedicineReminder[] }>("/medicine-reminders");
    },
    create(payload: {
      medicineName: string;
      dosage: string;
      frequency: string;
      timeOfDay: string[];
      endDate: string;
      notes: string;
    }) {
      return request<{ medicineReminder: MedicineReminder }>("/medicine-reminders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  testSchedules: {
    list() {
      return request<{ testSchedules: TestSchedule[] }>("/test-schedules");
    },
    create(payload: {
      testName: string;
      labName: string;
      scheduledDate: string;
      instructions: string;
    }) {
      return request<{ testSchedule: TestSchedule }>("/test-schedules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  symptoms: {
    analyze(symptoms: string[]) {
      return request<SymptomResult>("/symptoms/analyze", {
        method: "POST",
        body: JSON.stringify({ symptoms }),
      });
    },
    sideEffects(medicineName: string) {
      return request<SideEffectResult>("/symptoms/side-effects", {
        method: "POST",
        body: JSON.stringify({ medicineName }),
      });
    },
  },
  symptomChecks: {
    list() {
      return request<{ symptomChecks: SymptomCheck[] }>("/symptom-checks");
    },
  },
};

export { ApiError };
