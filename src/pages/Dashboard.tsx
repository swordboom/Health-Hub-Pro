import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type Appointment, type HealthProfile, type MedicineReminder, type TestSchedule } from "@/lib/api";
import {
  Heart,
  Activity,
  Droplets,
  Scale,
  CalendarDays,
  Pill,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  Clock,
  TestTube,
  User,
} from "lucide-react";
import { format } from "date-fns";

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<MedicineReminder[]>([]);
  const [tests, setTests] = useState<TestSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const response = await api.dashboard.getSummary();
        if (!active) {
          return;
        }

        setProfile(response.profile);
        setAppointments(response.appointments);
        setMedicines(response.medicineReminders);
        setTests(response.testSchedules);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, []);

  const calculateBMI = () => {
    if (profile?.heightCm && profile?.weightKg) {
      const heightM = profile.heightCm / 100;
      const bmi = profile.weightKg / (heightM * heightM);
      return bmi.toFixed(1);
    }

    return null;
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", className: "status-warning" };
    if (bmi < 25) return { label: "Normal", className: "status-good" };
    if (bmi < 30) return { label: "Overweight", className: "status-warning" };
    return { label: "Obese", className: "status-critical" };
  };

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(Number.parseFloat(bmi)) : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Welcome back, {profile?.fullName?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-muted-foreground mt-1">Here's your health overview for today</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="lg" asChild>
              <Link to="/onboarding">
                <User className="h-5 w-5 mr-2" />
                Edit Personal Info
              </Link>
            </Button>
            <Button variant="emergency" size="lg" asChild className="pulse-emergency">
              <Link to="/emergency">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Emergency
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs">
                Blood Type
              </Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">{profile?.bloodType || "N/A"}</p>
            <p className="text-sm text-muted-foreground">Your blood group</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              {bmiStatus && <Badge className={`text-xs ${bmiStatus.className}`}>{bmiStatus.label}</Badge>}
            </div>
            <p className="text-2xl font-bold text-foreground">{bmi || "N/A"}</p>
            <p className="text-sm text-muted-foreground">BMI Index</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {profile?.weightKg || "N/A"} <span className="text-base font-normal text-muted-foreground">kg</span>
            </p>
            <p className="text-sm text-muted-foreground">Current Weight</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {profile?.heightCm || "N/A"} <span className="text-base font-normal text-muted-foreground">cm</span>
            </p>
            <p className="text-sm text-muted-foreground">Height</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="health-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => (window.location.href = "/symptoms")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Stethoscope className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Know Your Disease</h3>
                  <p className="text-sm text-muted-foreground">Check symptoms and get guided insights</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="health-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => (window.location.href = "/connect")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <CalendarDays className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Book Appointment</h3>
                  <p className="text-sm text-muted-foreground">Connect with doctors and hospitals</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="health-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{appointment.doctorName}</span>
                        <Badge variant="outline" className="text-xs">
                          {appointment.doctorSpecialty || "General care"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.appointmentDate), "MMM d, yyyy h:mm a")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
              )}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/connect">View All</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="health-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Medicine Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicines.length > 0 ? (
                <div className="space-y-3">
                  {medicines.map((medicine) => (
                    <div key={medicine.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="font-medium text-sm mb-1">{medicine.medicineName}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{medicine.dosage}</span>
                        <div className="flex gap-1">
                          {medicine.timeOfDay.map((time, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active reminders</p>
              )}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/connect">Manage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="health-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                Scheduled Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tests.length > 0 ? (
                <div className="space-y-3">
                  {tests.map((test) => (
                    <div key={test.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="font-medium text-sm mb-1">{test.testName}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(test.scheduledDate), "MMM d, yyyy")}
                        {test.labName && <span className="ml-2">- {test.labName}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No scheduled tests</p>
              )}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/connect">Schedule Test</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
