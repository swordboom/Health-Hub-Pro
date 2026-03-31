import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Heart, User, Droplets, Ruler, Phone, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Other", "Prefer not to say"];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    heightCm: "",
    weightKg: "",
    allergies: "",
    chronicConditions: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const response = await api.profile.get();
        if (!active) {
          return;
        }

        if (response.profile) {
          setHasExistingProfile(true);
          setFormData({
            fullName: response.profile.fullName || user.fullName,
            dateOfBirth: response.profile.dateOfBirth || "",
            gender: response.profile.gender || "",
            bloodType: response.profile.bloodType || "",
            heightCm: response.profile.heightCm ? String(response.profile.heightCm) : "",
            weightKg: response.profile.weightKg ? String(response.profile.weightKg) : "",
            allergies: response.profile.allergies.join(", "),
            chronicConditions: response.profile.chronicConditions.join(", "),
            emergencyContactName: response.profile.emergencyContactName || "",
            emergencyContactPhone: response.profile.emergencyContactPhone || "",
          });
          return;
        }

        setHasExistingProfile(false);
        setFormData((current) => ({
          ...current,
          fullName: current.fullName || user.fullName,
        }));
      } catch {
        setFormData((current) => ({
          ...current,
          fullName: current.fullName || user.fullName,
        }));
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const updateFormData = (field: string, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    try {
      await api.profile.save({
        ...formData,
        allergies: formData.allergies
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        chronicConditions: formData.chronicConditions
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });

      toast.success(hasExistingProfile ? "Health profile updated successfully!" : "Health profile created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save health profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">HealthHub</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {step} of {totalSteps}
          </p>
          {hasExistingProfile && (
            <p className="text-xs text-muted-foreground text-center mt-1">Editing your existing health profile</p>
          )}
        </div>

        <Card className="border-none shadow-xl animate-fade-in">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display">Personal Information</CardTitle>
                <CardDescription>Let's start with your basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(event) => updateFormData("fullName", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(event) => updateFormData("dateOfBirth", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" size="lg" onClick={handleNext} disabled={!formData.fullName}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display">Health Details</CardTitle>
                <CardDescription>Tell us about your health metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => updateFormData("bloodType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        className="pl-10"
                        value={formData.heightCm}
                        onChange={(event) => updateFormData("heightCm", event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weightKg}
                      onChange={(event) => updateFormData("weightKg", event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Input
                    id="allergies"
                    placeholder="Peanuts, Penicillin, etc."
                    value={formData.allergies}
                    onChange={(event) => updateFormData("allergies", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditions">Chronic Conditions (comma separated)</Label>
                  <Input
                    id="conditions"
                    placeholder="Diabetes, Hypertension, etc."
                    value={formData.chronicConditions}
                    onChange={(event) => updateFormData("chronicConditions", event.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" size="lg" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-1" size="lg" onClick={handleNext}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display">Emergency Contact</CardTitle>
                <CardDescription>Who should we contact in case of emergency?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    placeholder="Emergency contact's name"
                    value={formData.emergencyContactName}
                    onChange={(event) => updateFormData("emergencyContactName", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      placeholder="+91 XXXXX-XXXXX"
                      className="pl-10"
                      value={formData.emergencyContactPhone}
                      onChange={(event) => updateFormData("emergencyContactPhone", event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" size="lg" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-1" size="lg" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Saving..." : (
                      <>
                        {hasExistingProfile ? "Save Changes" : "Complete"} <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
