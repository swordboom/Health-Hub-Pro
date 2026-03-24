import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, type SideEffectResult, type SymptomResult } from "@/lib/api";
import {
  Search,
  Stethoscope,
  Pill,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import { toast } from "sonner";

const commonSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Chest pain",
  "Shortness of breath",
  "Joint pain",
  "Back pain",
  "Sore throat",
  "Runny nose",
  "Muscle aches",
  "Stomach pain",
  "Vomiting",
  "Diarrhea",
  "Skin rash",
  "Swelling",
  "Numbness",
  "Weakness",
];

const Symptoms: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [loading, setLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState<SymptomResult | null>(null);
  const [sideEffectResult, setSideEffectResult] = useState<SideEffectResult | null>(null);
  const [activeTab, setActiveTab] = useState("symptoms");

  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((entry) => entry !== symptom));
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms([...selectedSymptoms, trimmed]);
      setCustomSymptom("");
    }
  };

  const analyzeSelectedSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }

    setLoading(true);
    setSymptomResult(null);

    try {
      const response = await api.symptoms.analyze(selectedSymptoms);
      setSymptomResult(response);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  const checkSideEffects = async () => {
    if (!medicineName.trim()) {
      toast.error("Please enter a medicine name");
      return;
    }

    setLoading(true);
    setSideEffectResult(null);

    try {
      const response = await api.symptoms.sideEffects(medicineName);
      setSideEffectResult(response);
      toast.success("Side effects retrieved!");
    } catch (error) {
      console.error("Error checking side effects:", error);
      toast.error(error instanceof Error ? error.message : "Failed to check side effects");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "immediate":
        return "status-critical";
      case "soon":
        return "status-warning";
      default:
        return "status-good";
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "status-critical";
      case "moderate":
        return "status-warning";
      default:
        return "status-good";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Know Your Disease</h1>
          <p className="text-muted-foreground mt-1">Guided symptom analysis and medicine information</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="symptoms" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Check Symptoms
            </TabsTrigger>
            <TabsTrigger value="sideeffects" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Side Effects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="health-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Select Your Symptoms
                  </CardTitle>
                  <CardDescription>Choose from common symptoms or add your own</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom symptom..."
                      value={customSymptom}
                      onChange={(event) => setCustomSymptom(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          addCustomSymptom();
                        }
                      }}
                    />
                    <Button onClick={addCustomSymptom} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedSymptoms.length > 0 && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium mb-2">Selected ({selectedSymptoms.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSymptoms.map((symptom) => (
                          <Badge key={symptom} variant="default" className="flex items-center gap-1">
                            {symptom}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeSymptom(symptom)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Common Symptoms</p>
                    <ScrollArea className="h-48">
                      <div className="flex flex-wrap gap-2">
                        {commonSymptoms.map((symptom) => (
                          <Badge
                            key={symptom}
                            variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                            className="cursor-pointer transition-colors"
                            onClick={() =>
                              selectedSymptoms.includes(symptom) ? removeSymptom(symptom) : addSymptom(symptom)
                            }
                          >
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <Button className="w-full" size="lg" onClick={analyzeSelectedSymptoms} disabled={loading || selectedSymptoms.length === 0}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="h-4 w-4 mr-2" /> Analyze Symptoms
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {symptomResult ? (
                  <>
                    <Card className="health-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Urgency Level</span>
                          </div>
                          <Badge className={getUrgencyColor(symptomResult.urgencyLevel)}>
                            {symptomResult.urgencyLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="health-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Possible Conditions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {symptomResult.possibleConditions.map((condition) => (
                          <div key={condition.name} className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{condition.name}</span>
                              <Badge className={getProbabilityColor(condition.probability)}>{condition.probability}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{condition.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="health-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className="h-5 w-5 text-primary" />
                          Suggested Medicines
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {symptomResult.suggestedMedicines.length > 0 ? (
                          symptomResult.suggestedMedicines.map((medicine) => (
                            <div key={medicine.name} className="p-3 rounded-lg bg-secondary/50 border border-border">
                              <div className="font-semibold">{medicine.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {medicine.dosage} - {medicine.purpose}
                              </div>
                              {medicine.warning && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                                  <AlertCircle className="h-3 w-3" />
                                  {medicine.warning}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No medicine suggestion is appropriate for this symptom pattern.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="health-card border-primary/30 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Consult a</p>
                            <p className="font-semibold text-primary">{symptomResult.doctorType}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="health-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          General Advice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {symptomResult.generalAdvice.map((advice) => (
                            <li key={advice} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              {advice}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-xs text-muted-foreground">{symptomResult.disclaimer}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="health-card h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <Stethoscope className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No Analysis Yet</h3>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        Select your symptoms from the list and click "Analyze Symptoms" to get guided insights
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sideeffects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="health-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Check Medicine Side Effects
                  </CardTitle>
                  <CardDescription>Enter a medicine name to see side effects and interactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Ibuprofen, Aspirin, Metformin..."
                      value={medicineName}
                      onChange={(event) => setMedicineName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void checkSideEffects();
                        }
                      }}
                    />
                  </div>
                  <Button className="w-full" size="lg" onClick={checkSideEffects} disabled={loading || !medicineName.trim()}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" /> Check Side Effects
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {sideEffectResult ? (
                  <>
                    <Card className="health-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Common Side Effects</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {sideEffectResult.commonSideEffects.map((effect) => (
                          <div key={effect.effect} className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{effect.effect}</span>
                              <Badge className={getSeverityColor(effect.severity)}>{effect.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{effect.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="health-card border-destructive/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Serious Side Effects
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {sideEffectResult.seriousSideEffects.map((effect) => (
                          <div key={effect.effect} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <div className="font-medium text-destructive">{effect.effect}</div>
                            <p className="text-sm text-muted-foreground mt-1">{effect.description}</p>
                            <p className="text-xs text-destructive mt-2 font-medium">
                              When to seek help: {effect.whenToSeekHelp}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="health-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Drug Interactions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {sideEffectResult.drugInteractions.map((interaction) => (
                          <div key={interaction.drug} className="flex items-start gap-2 p-2 rounded bg-yellow-500/10">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div>
                              <span className="font-medium">{interaction.drug}:</span>
                              <span className="text-sm text-muted-foreground ml-1">{interaction.interaction}</span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="health-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Precautions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {sideEffectResult.precautions.map((precaution) => (
                            <li key={precaution} className="flex items-start gap-2 text-sm">
                              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              {precaution}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-xs text-muted-foreground">{sideEffectResult.disclaimer}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="health-card h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <Pill className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Check Medicine Side Effects</h3>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        Enter a medicine name to learn about side effects, drug interactions, and precautions
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Symptoms;
