import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, type Appointment, type MedicineReminder, type TestSchedule } from "@/lib/api";
import {
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Plus,
  Pill,
  TestTube,
  Star,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const specialties = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "Gynecologist",
  "Ophthalmologist",
  "ENT Specialist",
];

const hospitals = [
  { name: "SIMS Hospitals", rating: 4.7, location: "Vadapalani", phone: "044 2000 2001" },
  { name: "Apollo Hospital Greams Lane", rating: 4.8, location: "Thousand Lights", phone: "080 6904 9756" },
  { name: "MGM Healthcare", rating: 4.6, location: "Raja Annamalaipuram", phone: "044 4524 2407" },
  { name: "Dr.Kamakshi Memorial Hospital", rating: 4.4, location: "Pallikaranai", phone: "044 6630 0300" },
];

const doctors = [
  { name: "Dr. Sarah Johnson", specialty: "Cardiologist", rating: 4.9, available: "Mon-Fri" },
  { name: "Dr. Michael Chen", specialty: "General Physician", rating: 4.7, available: "Mon-Sat" },
  { name: "Dr. Emily Brown", specialty: "Dermatologist", rating: 4.8, available: "Tue-Fri" },
  { name: "Dr. James Wilson", specialty: "Neurologist", rating: 4.6, available: "Wed-Sun" },
];

const Connect: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>([]);
  const [testSchedules, setTestSchedules] = useState<TestSchedule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"appointment" | "medicine" | "test">("appointment");

  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: "",
    specialty: "",
    hospitalName: "",
    date: "",
    time: "",
    notes: "",
  });

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    times: [] as string[],
    endDate: "",
    notes: "",
  });

  const [testForm, setTestForm] = useState({
    name: "",
    labName: "",
    date: "",
    instructions: "",
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentResponse, medicineResponse, testResponse] = await Promise.all([
        api.appointments.list(),
        api.medicineReminders.list(),
        api.testSchedules.list(),
      ]);

      setAppointments(appointmentResponse.appointments);
      setMedicineReminders(medicineResponse.medicineReminders);
      setTestSchedules(testResponse.testSchedules);
    } catch (error) {
      console.error("Error fetching connect data:", error);
      toast.error("Failed to load your healthcare data");
    }
  };

  const handleAddAppointment = async () => {
    if (!appointmentForm.doctorName || !appointmentForm.date || !appointmentForm.time) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await api.appointments.create({
        doctorName: appointmentForm.doctorName,
        doctorSpecialty: appointmentForm.specialty,
        hospitalName: appointmentForm.hospitalName,
        appointmentDate: new Date(`${appointmentForm.date}T${appointmentForm.time}`).toISOString(),
        notes: appointmentForm.notes,
      });

      toast.success("Appointment scheduled successfully!");
      setDialogOpen(false);
      setAppointmentForm({ doctorName: "", specialty: "", hospitalName: "", date: "", time: "", notes: "" });
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add appointment");
    }
  };

  const handleAddMedicine = async () => {
    if (!medicineForm.name || !medicineForm.dosage || medicineForm.times.length === 0) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await api.medicineReminders.create({
        medicineName: medicineForm.name,
        dosage: medicineForm.dosage,
        frequency: medicineForm.frequency,
        timeOfDay: medicineForm.times,
        endDate: medicineForm.endDate,
        notes: medicineForm.notes,
      });

      toast.success("Medicine reminder added!");
      setDialogOpen(false);
      setMedicineForm({ name: "", dosage: "", frequency: "daily", times: [], endDate: "", notes: "" });
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add medicine reminder");
    }
  };

  const handleAddTest = async () => {
    if (!testForm.name || !testForm.date) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await api.testSchedules.create({
        testName: testForm.name,
        labName: testForm.labName,
        scheduledDate: new Date(testForm.date).toISOString(),
        instructions: testForm.instructions,
      });

      toast.success("Test scheduled successfully!");
      setDialogOpen(false);
      setTestForm({ name: "", labName: "", date: "", instructions: "" });
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to schedule test");
    }
  };

  const openDialog = (type: "appointment" | "medicine" | "test") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const toggleMedicineTime = (time: string) => {
    setMedicineForm((previous) => ({
      ...previous,
      times: previous.times.includes(time)
        ? previous.times.filter((entry) => entry !== time)
        : [...previous.times, time],
    }));
  };

  const filteredDoctors = doctors
    .filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((doctor) => selectedSpecialty === "all" || doctor.specialty === selectedSpecialty);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Connect</h1>
            <p className="text-muted-foreground mt-1">Find doctors, hospitals, and manage your healthcare</p>
          </div>
        </div>

        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Hospitals</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Manage</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.name} className="health-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{doctor.rating}</span>
                            <span className="text-xs text-muted-foreground">- Available: {doctor.available}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        setAppointmentForm((previous) => ({
                          ...previous,
                          doctorName: doctor.name,
                          specialty: doctor.specialty,
                        }));
                        openDialog("appointment");
                      }}
                    >
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hospitals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.map((hospital) => (
                <Card key={hospital.name} className="health-card">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{hospital.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{hospital.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {hospital.location}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {hospital.phone}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Contact Hospital
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openDialog("appointment")}>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="health-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{appointment.doctorName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctorSpecialty || "General care"} - {appointment.hospitalName || "No hospital added"}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(appointment.appointmentDate), "MMM d, yyyy h:mm a")}
                            </div>
                          </div>
                        </div>
                        <Badge variant={appointment.status === "scheduled" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="health-card">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">No appointments yet</h3>
                  <p className="text-muted-foreground">Book your first appointment with a doctor</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="health-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      Medicine Reminders
                    </CardTitle>
                    <Button size="sm" onClick={() => openDialog("medicine")}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {medicineReminders.length > 0 ? (
                    <div className="space-y-3">
                      {medicineReminders.map((medicine) => (
                        <div key={medicine.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="font-medium">{medicine.medicineName}</div>
                          <div className="text-sm text-muted-foreground">
                            {medicine.dosage} - {medicine.frequency}
                          </div>
                          <div className="flex gap-1 mt-2">
                            {medicine.timeOfDay.map((time) => (
                              <Badge key={time} variant="secondary">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No medicine reminders</p>
                  )}
                </CardContent>
              </Card>

              <Card className="health-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-primary" />
                      Test Schedules
                    </CardTitle>
                    <Button size="sm" onClick={() => openDialog("test")}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {testSchedules.length > 0 ? (
                    <div className="space-y-3">
                      {testSchedules.map((testSchedule) => (
                        <div key={testSchedule.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="font-medium">{testSchedule.testName}</div>
                          <div className="text-sm text-muted-foreground">
                            {testSchedule.labName ? `${testSchedule.labName} - ` : ""}
                            {format(new Date(testSchedule.scheduledDate), "MMM d, yyyy")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No scheduled tests</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            {dialogType === "appointment" && (
              <>
                <DialogHeader>
                  <DialogTitle>Book Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Doctor Name *</Label>
                    <Input
                      value={appointmentForm.doctorName}
                      onChange={(event) => setAppointmentForm((previous) => ({ ...previous, doctorName: event.target.value }))}
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Select
                      value={appointmentForm.specialty}
                      onValueChange={(value) => setAppointmentForm((previous) => ({ ...previous, specialty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hospital</Label>
                    <Input
                      value={appointmentForm.hospitalName}
                      onChange={(event) => setAppointmentForm((previous) => ({ ...previous, hospitalName: event.target.value }))}
                      placeholder="Hospital name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={appointmentForm.date}
                        onChange={(event) => setAppointmentForm((previous) => ({ ...previous, date: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time *</Label>
                      <Input
                        type="time"
                        value={appointmentForm.time}
                        onChange={(event) => setAppointmentForm((previous) => ({ ...previous, time: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={appointmentForm.notes}
                      onChange={(event) => setAppointmentForm((previous) => ({ ...previous, notes: event.target.value }))}
                      placeholder="Any special notes..."
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddAppointment}>
                    Book Appointment
                  </Button>
                </div>
              </>
            )}

            {dialogType === "medicine" && (
              <>
                <DialogHeader>
                  <DialogTitle>Add Medicine Reminder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Medicine Name *</Label>
                    <Input
                      value={medicineForm.name}
                      onChange={(event) => setMedicineForm((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder="e.g., Aspirin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage *</Label>
                    <Input
                      value={medicineForm.dosage}
                      onChange={(event) => setMedicineForm((previous) => ({ ...previous, dosage: event.target.value }))}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time of Day *</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                        <Badge
                          key={time}
                          variant={medicineForm.times.includes(time) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleMedicineTime(time)}
                        >
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (optional)</Label>
                    <Input
                      type="date"
                      value={medicineForm.endDate}
                      onChange={(event) => setMedicineForm((previous) => ({ ...previous, endDate: event.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddMedicine}>
                    Add Reminder
                  </Button>
                </div>
              </>
            )}

            {dialogType === "test" && (
              <>
                <DialogHeader>
                  <DialogTitle>Schedule Test</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Name *</Label>
                    <Input
                      value={testForm.name}
                      onChange={(event) => setTestForm((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder="e.g., Blood Test"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lab Name</Label>
                    <Input
                      value={testForm.labName}
                      onChange={(event) => setTestForm((previous) => ({ ...previous, labName: event.target.value }))}
                      placeholder="Lab name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={testForm.date}
                      onChange={(event) => setTestForm((previous) => ({ ...previous, date: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      value={testForm.instructions}
                      onChange={(event) => setTestForm((previous) => ({ ...previous, instructions: event.target.value }))}
                      placeholder="e.g., Fasting required"
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddTest}>
                    Schedule Test
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Connect;
