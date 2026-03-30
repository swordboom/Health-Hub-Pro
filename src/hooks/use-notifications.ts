import { useCallback, useEffect, useMemo, useState } from "react";
import {
  api,
  type Appointment,
  type HealthProfile,
  type MedicineReminder,
  type SymptomCheck,
  type TestSchedule,
} from "@/lib/api";

type NotificationPriority = "critical" | "reminder" | "info";
type NotificationCategory = "appointment" | "medicine" | "test" | "profile" | "symptom";

export interface NotificationItem {
  id: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
}

interface UseNotificationsResult {
  notifications: NotificationItem[];
  unreadCount: number;
  criticalUnreadCount: number;
  loading: boolean;
  refreshing: boolean;
  isRead: (id: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  snooze: (id: string, minutes?: number) => void;
  clearHistory: () => void;
  refresh: () => Promise<void>;
}

const REFRESH_INTERVAL_MS = 60_000;
const STORAGE_PREFIX = "healthhub.notifications";
const PRIORITY_WEIGHT: Record<NotificationPriority, number> = {
  critical: 0,
  reminder: 1,
  info: 2,
};

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseDateValue(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function parseEndOfDayValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "scheduled soon";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCurrentTimeSlot(date: Date) {
  const hour = date.getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 17) {
    return "afternoon";
  }
  if (hour < 21) {
    return "evening";
  }

  return "night";
}

function normalizeTimeSlots(reminder: MedicineReminder) {
  return reminder.timeOfDay.map((slot) => String(slot).trim().toLowerCase());
}

function isWithin(durationMs: number, futureTimestamp: number, nowMs: number) {
  const delta = futureTimestamp - nowMs;
  return delta >= 0 && delta <= durationMs;
}

function buildAppointmentNotifications(appointments: Appointment[], nowMs: number) {
  return appointments
    .filter((appointment) => appointment.status === "scheduled")
    .flatMap((appointment) => {
      const appointmentTime = parseDateValue(appointment.appointmentDate);
      if (!appointmentTime || appointmentTime < nowMs) {
        return [];
      }

      if (!isWithin(72 * 60 * 60 * 1000, appointmentTime, nowMs)) {
        return [];
      }

      const priority: NotificationPriority = isWithin(2 * 60 * 60 * 1000, appointmentTime, nowMs)
        ? "critical"
        : isWithin(24 * 60 * 60 * 1000, appointmentTime, nowMs)
          ? "reminder"
          : "info";

      return [
        {
          id: `appointment-${appointment.id}-${appointment.appointmentDate}`,
          category: "appointment" as const,
          priority,
          title: priority === "critical" ? "Appointment in the next 2 hours" : "Upcoming appointment reminder",
          description: `${appointment.doctorName} at ${formatDateLabel(appointment.appointmentDate)}`,
          timestamp: appointment.appointmentDate,
          href: "/connect",
        },
      ];
    });
}

function buildTestNotifications(testSchedules: TestSchedule[], nowMs: number) {
  return testSchedules
    .filter((testSchedule) => testSchedule.status === "scheduled")
    .flatMap((testSchedule) => {
      const scheduledAt = parseDateValue(testSchedule.scheduledDate);
      if (!scheduledAt || scheduledAt < nowMs) {
        return [];
      }

      if (!isWithin(3 * 24 * 60 * 60 * 1000, scheduledAt, nowMs)) {
        return [];
      }

      const priority: NotificationPriority = isWithin(24 * 60 * 60 * 1000, scheduledAt, nowMs) ? "reminder" : "info";

      return [
        {
          id: `test-${testSchedule.id}-${testSchedule.scheduledDate}`,
          category: "test" as const,
          priority,
          title: priority === "reminder" ? "Scheduled test in the next 24 hours" : "Upcoming test schedule",
          description: `${testSchedule.testName} at ${formatDateLabel(testSchedule.scheduledDate)}`,
          timestamp: testSchedule.scheduledDate,
          href: "/connect",
        },
      ];
    });
}

function buildMedicineNotifications(medicineReminders: MedicineReminder[], now: Date) {
  const nowMs = now.getTime();
  const localDate = toLocalDateKey(now);
  const currentSlot = getCurrentTimeSlot(now);

  return medicineReminders
    .filter((reminder) => reminder.isActive)
    .flatMap((reminder) => {
      const endDateTimestamp = reminder.endDate ? parseEndOfDayValue(reminder.endDate) : null;
      if (endDateTimestamp && endDateTimestamp < nowMs) {
        return [];
      }

      const slots = normalizeTimeSlots(reminder);
      if (!slots.includes(currentSlot)) {
        return [];
      }

      return [
        {
          id: `medicine-${reminder.id}-${localDate}-${currentSlot}`,
          category: "medicine" as const,
          priority: "reminder" as const,
          title: "Medicine reminder due now",
          description: `${reminder.medicineName} - ${reminder.dosage}`,
          timestamp: new Date(nowMs).toISOString(),
          href: "/connect",
        },
      ];
    })
    .slice(0, 5);
}

function buildProfileNotifications(profile: HealthProfile | null) {
  if (!profile) {
    return [
      {
        id: "profile-missing",
        category: "profile" as const,
        priority: "reminder" as const,
        title: "Complete your health profile",
        description: "Add your health details so reminders and emergency guidance are accurate.",
        timestamp: new Date().toISOString(),
        href: "/onboarding",
      },
    ];
  }

  const notifications: NotificationItem[] = [];

  if (!profile.emergencyContactName || !profile.emergencyContactPhone) {
    notifications.push({
      id: "profile-emergency-contact-missing",
      category: "profile",
      priority: "critical",
      title: "Emergency contact is incomplete",
      description: "Add emergency contact details for faster support in critical situations.",
      timestamp: profile.updatedAt || profile.createdAt,
      href: "/onboarding",
    });
  }

  if (!profile.bloodType) {
    notifications.push({
      id: "profile-blood-type-missing",
      category: "profile",
      priority: "info",
      title: "Blood type is missing",
      description: "Adding blood type helps with emergency readiness and doctor context.",
      timestamp: profile.updatedAt || profile.createdAt,
      href: "/onboarding",
    });
  }

  return notifications;
}

function buildSymptomNotifications(symptomChecks: SymptomCheck[], nowMs: number) {
  return symptomChecks
    .slice(0, 5)
    .flatMap((symptomCheck) => {
      const createdAt = parseDateValue(symptomCheck.createdAt);
      if (!createdAt || nowMs - createdAt > 7 * 24 * 60 * 60 * 1000) {
        return [];
      }

      const urgencyLevel = symptomCheck.aiResponse?.urgencyLevel;
      if (urgencyLevel !== "immediate" && urgencyLevel !== "soon") {
        return [];
      }

      const priority: NotificationPriority = urgencyLevel === "immediate" ? "critical" : "reminder";
      const topSymptoms = symptomCheck.symptoms.slice(0, 3).join(", ");
      const context = symptomCheck.detectedDisease
        ? `Detected pattern: ${symptomCheck.detectedDisease}.`
        : topSymptoms
          ? `Recent symptoms: ${topSymptoms}.`
          : "Recent symptom analysis available.";

      return [
        {
          id: `symptom-${symptomCheck.id}`,
          category: "symptom" as const,
          priority,
          title:
            urgencyLevel === "immediate"
              ? "Recent symptom check indicates urgent follow-up"
              : "Recent symptom check suggests near-term follow-up",
          description: context,
          timestamp: symptomCheck.createdAt,
          href: "/symptoms",
        },
      ];
    });
}

function buildNotifications(input: {
  appointments: Appointment[];
  medicineReminders: MedicineReminder[];
  testSchedules: TestSchedule[];
  profile: HealthProfile | null;
  symptomChecks: SymptomCheck[];
  now: Date;
}) {
  const nowMs = input.now.getTime();

  return [
    ...buildProfileNotifications(input.profile),
    ...buildAppointmentNotifications(input.appointments, nowMs),
    ...buildMedicineNotifications(input.medicineReminders, input.now),
    ...buildTestNotifications(input.testSchedules, nowMs),
    ...buildSymptomNotifications(input.symptomChecks, nowMs),
  ]
    .sort((left, right) => {
      const priorityDelta = PRIORITY_WEIGHT[left.priority] - PRIORITY_WEIGHT[right.priority];
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return (parseDateValue(right.timestamp) || 0) - (parseDateValue(left.timestamp) || 0);
    })
    .slice(0, 30);
}

function getReadStorageKey(userId: string) {
  return `${STORAGE_PREFIX}.read.${userId}`;
}

function getSnoozeStorageKey(userId: string) {
  return `${STORAGE_PREFIX}.snooze.${userId}`;
}

export function useNotifications(userId: string | null): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [snoozedUntilById, setSnoozedUntilById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userId) {
      setReadIds(new Set());
      setSnoozedUntilById({});
      return;
    }

    const nextReadIds = new Set(parseJson<string[]>(window.localStorage.getItem(getReadStorageKey(userId)), []));
    const nextSnoozedById = parseJson<Record<string, string>>(window.localStorage.getItem(getSnoozeStorageKey(userId)), {});
    setReadIds(nextReadIds);
    setSnoozedUntilById(nextSnoozedById);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    window.localStorage.setItem(getReadStorageKey(userId), JSON.stringify(Array.from(readIds)));
  }, [userId, readIds]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    window.localStorage.setItem(getSnoozeStorageKey(userId), JSON.stringify(snoozedUntilById));
  }, [userId, snoozedUntilById]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setRefreshing(true);

    try {
      const [appointmentsResponse, medicineRemindersResponse, testSchedulesResponse, profileResponse, symptomChecksResponse] =
        await Promise.all([
          api.appointments.list(),
          api.medicineReminders.list(),
          api.testSchedules.list(),
          api.profile.get(),
          api.symptomChecks.list(),
        ]);

      const now = new Date();
      const nextNotifications = buildNotifications({
        appointments: appointmentsResponse.appointments,
        medicineReminders: medicineRemindersResponse.medicineReminders,
        testSchedules: testSchedulesResponse.testSchedules,
        profile: profileResponse.profile,
        symptomChecks: symptomChecksResponse.symptomChecks,
        now,
      });

      setNotifications(nextNotifications);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) {
        return;
      }
      await refresh();
    };

    void load();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const activeNotifications = useMemo(() => {
    const nowMs = Date.now();
    const nextActive = notifications.filter((notification) => {
      const snoozedUntil = snoozedUntilById[notification.id];
      if (!snoozedUntil) {
        return true;
      }

      const snoozedUntilMs = parseDateValue(snoozedUntil);
      if (!snoozedUntilMs) {
        return true;
      }

      return snoozedUntilMs <= nowMs;
    });

    return nextActive;
  }, [notifications, snoozedUntilById]);

  const unreadCount = useMemo(
    () => activeNotifications.filter((notification) => !readIds.has(notification.id)).length,
    [activeNotifications, readIds],
  );

  const criticalUnreadCount = useMemo(
    () =>
      activeNotifications.filter(
        (notification) => notification.priority === "critical" && !readIds.has(notification.id),
      ).length,
    [activeNotifications, readIds],
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((current) => {
      if (current.has(id)) {
        return current;
      }

      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      activeNotifications.forEach((notification) => {
        next.add(notification.id);
      });
      return next;
    });
  }, [activeNotifications]);

  const snooze = useCallback((id: string, minutes = 60) => {
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setSnoozedUntilById((current) => ({
      ...current,
      [id]: snoozedUntil,
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setReadIds(new Set());
    setSnoozedUntilById({});
  }, []);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  return {
    notifications: activeNotifications,
    unreadCount,
    criticalUnreadCount,
    loading,
    refreshing,
    isRead,
    markAsRead,
    markAllAsRead,
    snooze,
    clearHistory,
    refresh,
  };
}
