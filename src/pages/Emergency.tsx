import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type HealthProfile } from "@/lib/api";
import {
  AlertTriangle,
  Phone,
  Ambulance,
  Hospital,
  Heart,
  Droplets,
  User,
  AlertCircle,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const emergencyNumbers = [
  { name: "Emergency Services", number: "112", icon: AlertTriangle, color: "bg-red-500" },
  { name: "Ambulance", number: "108", icon: Ambulance, color: "bg-orange-500" },
  { name: "Poison Control", number: "1800-425-1213", icon: AlertCircle, color: "bg-sky-600" },
  { name: "Hospital Helpline", number: "104", icon: Hospital, color: "bg-blue-500" },
];

function toDialableNumber(number: string) {
  return number.replace(/[^+\d]/g, "");
}

const Emergency: React.FC = () => {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const response = await api.profile.get();
        if (active) {
          setProfile(response.profile);
        }
      } catch (error) {
        console.error("Error loading emergency profile:", error);
      }
    };

    void fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleCall = (number: string) => {
    const dialableNumber = toDialableNumber(number);
    if (!dialableNumber) {
      toast.error("Phone number is not available");
      return;
    }

    window.location.assign(`tel:${dialableNumber}`);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center pb-4">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 pulse-emergency">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Emergency Services</h1>
          <p className="text-muted-foreground mt-2">Quick access to emergency contacts and your health information</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyNumbers.map((emergency) => (
            <Button
              key={emergency.number}
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 hover:border-destructive/50 transition-all"
              onClick={() => handleCall(emergency.number)}
            >
              <div className={`w-12 h-12 rounded-full ${emergency.color} flex items-center justify-center`}>
                <emergency.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{emergency.name}</p>
                <p className="text-lg font-bold text-primary">{emergency.number}</p>
              </div>
            </Button>
          ))}
        </div>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <Button variant="emergency" size="xl" className="w-full text-lg" onClick={() => handleCall("112")}>
              <Phone className="h-6 w-6 mr-3 animate-pulse" />
              Call Emergency (112)
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Tap the button above to immediately dial emergency services
            </p>
          </CardContent>
        </Card>

        {profile && (
          <Card className="health-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Your Emergency Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Full Name</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(profile.fullName, "name")}>
                        {copiedField === "name" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="font-semibold text-lg">{profile.fullName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">Blood Type</span>
                      </div>
                      <p className="font-bold text-2xl">{profile.bloodType || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Age</span>
                      </div>
                      <p className="font-bold text-2xl">
                        {profile.dateOfBirth
                          ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {profile.allergies.length > 0 && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Allergies</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.chronicConditions.length > 0 && (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">Chronic Conditions</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.chronicConditions.map((condition) => (
                          <Badge key={condition} variant="outline" className="border-yellow-500 text-yellow-700">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.emergencyContactName ? (
                        <>
                          <p className="font-semibold text-lg mb-1">{profile.emergencyContactName}</p>
                          <p className="text-muted-foreground mb-4">{profile.emergencyContactPhone}</p>
                          <Button className="w-full" onClick={() => handleCall(profile.emergencyContactPhone || "")}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call Emergency Contact
                          </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No emergency contact set</p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <h4 className="font-medium mb-2">Quick Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>Stay calm and assess the situation.</li>
                      <li>Provide your location clearly to dispatchers.</li>
                      <li>Keep this emergency card accessible.</li>
                      <li>Share your allergies with medical personnel.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="health-card">
          <CardHeader>
            <CardTitle className="text-lg">First Aid Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-semibold mb-2">Heart Attack Signs</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Chest pain or discomfort</li>
                  <li>Shortness of breath</li>
                  <li>Cold sweats or nausea</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-semibold mb-2">Stroke Signs (F.A.S.T)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Face drooping</li>
                  <li>Arm weakness</li>
                  <li>Speech difficulty</li>
                  <li>Time to call 112</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-semibold mb-2">Severe Bleeding</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Apply direct pressure</li>
                  <li>Elevate the wound if safe</li>
                  <li>Call for help immediately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Emergency;
