const conditions = [
  {
    name: "Seasonal Flu",
    description:
      "A viral infection that often causes fever, cough, sore throat, body aches, headache, and low energy.",
    symptoms: ["fever", "cough", "fatigue", "sore throat", "runny nose", "muscle aches", "headache"],
    doctorType: "General Physician",
    urgencyLevel: "soon",
    medicines: [
      {
        name: "Paracetamol",
        dosage: "500 mg every 6 to 8 hours as needed",
        purpose: "Helps with fever and body aches",
        warning: "Avoid exceeding the package limit, especially with liver disease.",
      },
      {
        name: "Cetirizine",
        dosage: "10 mg once daily if needed",
        purpose: "Can help with runny nose and sneezing",
        warning: "May cause drowsiness in some people.",
      },
    ],
    advice: [
      "Rest, hydrate well, and monitor your temperature.",
      "Seek medical care sooner if breathing becomes difficult or fever stays high.",
    ],
  },
  {
    name: "Common Cold",
    description:
      "A mild upper respiratory infection that usually causes sore throat, cough, congestion, and runny nose.",
    symptoms: ["cough", "sore throat", "runny nose", "headache", "fatigue"],
    doctorType: "General Physician",
    urgencyLevel: "routine",
    medicines: [
      {
        name: "Paracetamol",
        dosage: "500 mg every 6 to 8 hours as needed",
        purpose: "Helps reduce discomfort and headache",
      },
      {
        name: "Lozenges",
        dosage: "Use as directed on the label",
        purpose: "Can soothe throat irritation",
      },
    ],
    advice: [
      "Drink warm fluids and get extra rest.",
      "Symptoms that worsen after several days should be checked by a clinician.",
    ],
  },
  {
    name: "Migraine or Severe Headache",
    description:
      "Migraine episodes can present with headache, nausea, light sensitivity, dizziness, and fatigue.",
    symptoms: ["headache", "nausea", "dizziness", "fatigue", "weakness"],
    doctorType: "Neurologist",
    urgencyLevel: "soon",
    medicines: [
      {
        name: "Ibuprofen",
        dosage: "200 to 400 mg every 6 to 8 hours as needed",
        purpose: "Can help reduce headache pain",
        warning: "Avoid on an empty stomach or if you have stomach ulcers or kidney disease.",
      },
      {
        name: "Oral rehydration fluids",
        dosage: "Sip steadily during the day",
        purpose: "Useful if nausea or poor intake is present",
      },
    ],
    advice: [
      "Rest in a dark, quiet room and avoid screens if they worsen symptoms.",
      "Urgent evaluation is needed for a sudden worst-ever headache, confusion, or weakness on one side.",
    ],
  },
  {
    name: "Gastroenteritis",
    description:
      "An infection or irritation of the stomach and intestines that can cause nausea, vomiting, diarrhea, and stomach pain.",
    symptoms: ["nausea", "vomiting", "diarrhea", "stomach pain", "fever", "fatigue"],
    doctorType: "General Physician",
    urgencyLevel: "soon",
    medicines: [
      {
        name: "Oral rehydration salts",
        dosage: "Use after each loose stool as directed",
        purpose: "Replaces fluid and electrolyte losses",
      },
      {
        name: "Paracetamol",
        dosage: "500 mg every 6 to 8 hours as needed",
        purpose: "Helps with fever and body aches",
      },
    ],
    advice: [
      "Take small frequent sips of fluid even if appetite is low.",
      "Medical care is important if vomiting prevents fluids, there is blood in stool, or symptoms are severe.",
    ],
  },
  {
    name: "Allergic Reaction",
    description:
      "Allergic reactions may cause skin rash, swelling, runny nose, and sometimes breathing difficulty.",
    symptoms: ["skin rash", "swelling", "runny nose", "shortness of breath", "nausea"],
    doctorType: "Allergist",
    urgencyLevel: "soon",
    medicines: [
      {
        name: "Cetirizine",
        dosage: "10 mg once daily if needed",
        purpose: "Can help reduce allergy symptoms",
        warning: "Breathing difficulty or facial swelling needs urgent care instead of self-treatment.",
      },
    ],
    advice: [
      "Avoid the suspected trigger if known.",
      "Any swelling of the lips, tongue, or trouble breathing should be treated as an emergency.",
    ],
  },
  {
    name: "Respiratory Tract Infection",
    description:
      "Persistent cough, fever, fatigue, and shortness of breath can suggest a chest infection or bronchitis.",
    symptoms: ["cough", "fever", "fatigue", "shortness of breath", "chest pain", "sore throat"],
    doctorType: "Pulmonologist",
    urgencyLevel: "soon",
    medicines: [
      {
        name: "Paracetamol",
        dosage: "500 mg every 6 to 8 hours as needed",
        purpose: "Can reduce fever and discomfort",
      },
      {
        name: "Steam inhalation",
        dosage: "Use carefully once or twice daily",
        purpose: "May help with congestion and irritation",
      },
    ],
    advice: [
      "Get checked promptly if cough is worsening or breathing feels labored.",
      "Hydration and rest are still important while arranging care.",
    ],
  },
  {
    name: "Possible Cardiac Issue",
    description:
      "Chest pain, shortness of breath, dizziness, sweating, or weakness can signal a serious heart-related emergency.",
    symptoms: ["chest pain", "shortness of breath", "dizziness", "weakness", "nausea"],
    doctorType: "Emergency Physician",
    urgencyLevel: "immediate",
    medicines: [],
    advice: [
      "This symptom pattern should be assessed urgently in person.",
      "Do not drive yourself if symptoms are intense or worsening. Call emergency services instead.",
    ],
  },
  {
    name: "Possible Stroke Alert",
    description:
      "Sudden numbness, weakness, dizziness, speech trouble, or severe headache can be warning signs of a stroke.",
    symptoms: ["numbness", "weakness", "dizziness", "headache"],
    doctorType: "Emergency Physician",
    urgencyLevel: "immediate",
    medicines: [],
    advice: [
      "Stroke symptoms need emergency evaluation immediately.",
      "Call for emergency help right away if symptoms are sudden or one-sided.",
    ],
  },
  {
    name: "Joint or Inflammatory Condition",
    description:
      "Joint pain, swelling, and fatigue may be related to overuse, inflammation, or an underlying musculoskeletal condition.",
    symptoms: ["joint pain", "swelling", "fatigue", "back pain", "weakness"],
    doctorType: "Orthopedic Specialist",
    urgencyLevel: "routine",
    medicines: [
      {
        name: "Ibuprofen",
        dosage: "200 to 400 mg every 6 to 8 hours as needed",
        purpose: "Can help reduce pain and inflammation",
        warning: "Avoid if a doctor has advised against anti-inflammatory medicine.",
      },
    ],
    advice: [
      "Rest the affected area and avoid heavy strain until it improves.",
      "Persistent swelling, fever, or severe pain deserves prompt assessment.",
    ],
  },
];

const medicineProfiles = {
  aspirin: {
    commonSideEffects: [
      {
        effect: "Stomach upset",
        description: "Can cause nausea, irritation, or heartburn.",
        severity: "mild",
      },
      {
        effect: "Easy bruising",
        description: "Aspirin affects platelets and can increase bleeding tendency.",
        severity: "moderate",
      },
    ],
    seriousSideEffects: [
      {
        effect: "Stomach bleeding",
        description: "Black stools, vomiting blood, or severe stomach pain may signal internal bleeding.",
        whenToSeekHelp: "Get urgent medical help immediately.",
      },
    ],
    drugInteractions: [
      {
        drug: "Warfarin and blood thinners",
        interaction: "Raises bleeding risk significantly.",
      },
      {
        drug: "Ibuprofen",
        interaction: "Can increase stomach irritation and may affect aspirin's antiplatelet effect.",
      },
    ],
    precautions: [
      "Take with food unless your clinician advised otherwise.",
      "Avoid use in children with viral illness unless specifically prescribed.",
    ],
  },
  ibuprofen: {
    commonSideEffects: [
      {
        effect: "Heartburn",
        description: "Can irritate the stomach lining.",
        severity: "mild",
      },
      {
        effect: "Nausea",
        description: "Some people feel queasy, especially on an empty stomach.",
        severity: "mild",
      },
    ],
    seriousSideEffects: [
      {
        effect: "Stomach ulcer or bleeding",
        description: "Risk rises with prolonged use or high doses.",
        whenToSeekHelp: "Seek urgent care for black stools, vomiting blood, or severe abdominal pain.",
      },
      {
        effect: "Kidney injury",
        description: "Can worsen kidney function in dehydrated people or those with kidney disease.",
        whenToSeekHelp: "Seek medical care for reduced urination, swelling, or unusual weakness.",
      },
    ],
    drugInteractions: [
      {
        drug: "Blood thinners",
        interaction: "Raises bleeding risk.",
      },
      {
        drug: "Steroids",
        interaction: "Raises the chance of stomach irritation and ulcers.",
      },
    ],
    precautions: [
      "Take with food and plenty of water.",
      "Avoid if you have a history of ulcers unless a clinician says it is safe.",
    ],
  },
  paracetamol: {
    commonSideEffects: [
      {
        effect: "Usually well tolerated",
        description: "Most side effects are uncommon at normal doses.",
        severity: "mild",
      },
    ],
    seriousSideEffects: [
      {
        effect: "Liver injury",
        description: "Taking too much can damage the liver.",
        whenToSeekHelp: "Get urgent medical help if an overdose is suspected.",
      },
    ],
    drugInteractions: [
      {
        drug: "Alcohol",
        interaction: "Raises liver injury risk, especially with high doses.",
      },
    ],
    precautions: [
      "Check other cold and flu medicines so you do not double-dose acetaminophen or paracetamol.",
      "Do not exceed the labeled daily maximum.",
    ],
  },
  acetaminophen: "paracetamol",
  metformin: {
    commonSideEffects: [
      {
        effect: "Loose stools",
        description: "Digestive upset is common when starting treatment.",
        severity: "mild",
      },
      {
        effect: "Nausea",
        description: "Often improves when taken with meals.",
        severity: "mild",
      },
    ],
    seriousSideEffects: [
      {
        effect: "Lactic acidosis",
        description: "Rare but serious, especially in people with kidney problems or severe dehydration.",
        whenToSeekHelp: "Seek urgent care for severe weakness, rapid breathing, or confusion.",
      },
    ],
    drugInteractions: [
      {
        drug: "Alcohol",
        interaction: "Can raise the risk of lactic acidosis.",
      },
    ],
    precautions: [
      "Take with meals if it upsets your stomach.",
      "Tell your clinician before contrast scans or major surgery.",
    ],
  },
  amoxicillin: {
    commonSideEffects: [
      {
        effect: "Diarrhea",
        description: "Loose stools can happen during antibiotic use.",
        severity: "mild",
      },
      {
        effect: "Rash",
        description: "Some rashes are mild, but others may signal allergy.",
        severity: "moderate",
      },
    ],
    seriousSideEffects: [
      {
        effect: "Allergic reaction",
        description: "Swelling, wheezing, or widespread rash can be serious.",
        whenToSeekHelp: "Seek urgent care for breathing difficulty or facial swelling.",
      },
    ],
    drugInteractions: [
      {
        drug: "Warfarin",
        interaction: "May alter bleeding risk in some patients.",
      },
    ],
    precautions: [
      "Take the full course exactly as prescribed.",
      "Report significant diarrhea or rash to a clinician.",
    ],
  },
  cetirizine: {
    commonSideEffects: [
      {
        effect: "Drowsiness",
        description: "Some people feel sleepy or slowed down.",
        severity: "mild",
      },
      {
        effect: "Dry mouth",
        description: "A common antihistamine effect.",
        severity: "mild",
      },
    ],
    seriousSideEffects: [
      {
        effect: "Severe allergic reaction",
        description: "Very rare, but any swelling or breathing difficulty is urgent.",
        whenToSeekHelp: "Get urgent medical care immediately.",
      },
    ],
    drugInteractions: [
      {
        drug: "Alcohol and sedatives",
        interaction: "Can increase drowsiness.",
      },
    ],
    precautions: [
      "Use caution before driving until you know how it affects you.",
      "Discuss kidney disease dosing with a clinician or pharmacist.",
    ],
  },
};

const genericSideEffects = {
  commonSideEffects: [
    {
      effect: "Upset stomach",
      description: "Digestive irritation is a common side effect across many medicines.",
      severity: "mild",
    },
    {
      effect: "Drowsiness or dizziness",
      description: "Some medicines may reduce alertness or coordination.",
      severity: "moderate",
    },
  ],
  seriousSideEffects: [
    {
      effect: "Allergic reaction",
      description: "Swelling, breathing trouble, or a rapidly spreading rash may be serious.",
      whenToSeekHelp: "Seek urgent medical help immediately.",
    },
  ],
  drugInteractions: [
    {
      drug: "Alcohol",
      interaction: "May increase drowsiness, stomach irritation, or liver stress depending on the medicine.",
    },
  ],
  precautions: [
    "Follow the exact label or prescription directions.",
    "Check with a pharmacist or clinician if you take multiple medicines together.",
  ],
};

const symptomAliases = {
  breathlessness: "shortness of breath",
  congestion: "runny nose",
  tiredness: "fatigue",
  tired: "fatigue",
};

const redFlagSymptoms = new Set(["chest pain", "shortness of breath", "numbness", "weakness"]);

function normalizeSymptom(symptom) {
  const normalized = String(symptom || "").trim().toLowerCase();
  return symptomAliases[normalized] || normalized;
}

function matchesSymptom(inputSymptom, conditionSymptom) {
  return inputSymptom === conditionSymptom || inputSymptom.includes(conditionSymptom) || conditionSymptom.includes(inputSymptom);
}

function scoreCondition(inputSymptoms, condition) {
  return condition.symptoms.reduce((score, symptom) => {
    const matched = inputSymptoms.some((inputSymptom) => matchesSymptom(inputSymptom, symptom));
    return matched ? score + 1 : score;
  }, 0);
}

function probabilityForScore(score, inputCount) {
  if (score >= Math.max(2, Math.ceil(inputCount * 0.6))) {
    return "high";
  }

  if (score >= 2 || (inputCount > 0 && score / inputCount >= 0.34)) {
    return "medium";
  }

  return "low";
}

function resolveUrgency(inputSymptoms, rankedConditions) {
  if (inputSymptoms.some((symptom) => redFlagSymptoms.has(symptom))) {
    return "immediate";
  }

  return rankedConditions[0]?.condition.urgencyLevel || "routine";
}

function uniqueByName(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function analyzeSymptoms(symptoms) {
  const normalizedSymptoms = symptoms.map(normalizeSymptom).filter(Boolean);

  const rankedConditions = conditions
    .map((condition) => ({
      condition,
      score: scoreCondition(normalizedSymptoms, condition),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const selectedConditions =
    rankedConditions.length > 0
      ? rankedConditions
      : [
          {
            condition: {
              name: "General Medical Concern",
              description:
                "The symptom combination is not specific enough for a confident rule-based match and should be reviewed clinically if it persists.",
              doctorType: "General Physician",
              urgencyLevel: "routine",
              medicines: [
                {
                  name: "Supportive care",
                  dosage: "Rest, fluids, and only use medicines already recommended to you",
                  purpose: "Helps with nonspecific symptoms while monitoring changes",
                },
              ],
              advice: [
                "Monitor how symptoms change over the next 24 to 48 hours.",
                "Seek care sooner if symptoms worsen or new red-flag symptoms appear.",
              ],
            },
            score: 1,
          },
        ];

  const urgencyLevel = resolveUrgency(normalizedSymptoms, selectedConditions);
  const possibleConditions = selectedConditions.map(({ condition, score }) => ({
    name: condition.name,
    probability: probabilityForScore(score, normalizedSymptoms.length),
    description: condition.description,
  }));

  const suggestedMedicines = uniqueByName(
    selectedConditions.flatMap(({ condition }) => condition.medicines),
  ).slice(0, 4);

  const generalAdvice = Array.from(
    new Set([
      ...selectedConditions.flatMap(({ condition }) => condition.advice),
      urgencyLevel === "immediate"
        ? "Because red-flag symptoms are present, seek urgent in-person medical help now."
        : "If symptoms keep getting worse, arrange a medical review promptly.",
    ]),
  ).slice(0, 5);

  return {
    possibleConditions,
    suggestedMedicines,
    doctorType: selectedConditions[0].condition.doctorType,
    generalAdvice,
    urgencyLevel,
    disclaimer:
      "This tool offers general informational guidance only and is not a diagnosis. Always consult a qualified medical professional for urgent, persistent, or severe symptoms.",
  };
}

export function analyzeSideEffects(medicineName) {
  const key = normalizeSymptom(medicineName);
  const profileReference = medicineProfiles[key];
  const profile = typeof profileReference === "string" ? medicineProfiles[profileReference] : profileReference;

  return {
    ...(profile || genericSideEffects),
    disclaimer:
      "Medicine information here is general and should not replace advice from your doctor or pharmacist. Use the official label and seek professional care for severe or unexpected reactions.",
  };
}
