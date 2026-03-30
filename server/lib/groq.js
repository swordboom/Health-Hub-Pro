import { Groq } from "groq-sdk";

const GROQ_MODEL = cleanText(process.env.GROQ_MODEL || process.env.GROK_MODEL || "openai/gpt-oss-120b");

const PROBABILITIES = new Set(["high", "medium", "low"]);
const URGENCY_LEVELS = new Set(["immediate", "soon", "routine"]);
const SEVERITIES = new Set(["mild", "moderate", "severe"]);

const SYMPTOM_DISCLAIMER =
  "This tool offers general informational guidance only and is not a diagnosis. Always consult a qualified medical professional for urgent, persistent, or severe symptoms.";
const SIDE_EFFECT_DISCLAIMER =
  "Medicine information here is general and should not replace advice from your doctor or pharmacist. Use the official label and seek professional care for severe or unexpected reactions.";

function cleanText(value) {
  return String(value ?? "").trim();
}

let cachedClient = null;
let cachedClientKey = "";

function cleanTextArray(value, limit = 5) {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueValues = new Set();

  return value
    .map((entry) => cleanText(entry))
    .filter((entry) => {
      if (!entry) {
        return false;
      }

      const key = entry.toLowerCase();
      if (uniqueValues.has(key)) {
        return false;
      }

      uniqueValues.add(key);
      return true;
    })
    .slice(0, limit);
}

function normalizeProbability(value) {
  const normalized = cleanText(value).toLowerCase();
  return PROBABILITIES.has(normalized) ? normalized : "low";
}

function normalizeUrgency(value) {
  const normalized = cleanText(value).toLowerCase();
  return URGENCY_LEVELS.has(normalized) ? normalized : "routine";
}

function normalizeSeverity(value) {
  const normalized = cleanText(value).toLowerCase();
  return SEVERITIES.has(normalized) ? normalized : "mild";
}

function stripCodeFence(value) {
  const trimmed = cleanText(value);

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
}

function parseGroqJson(text) {
  const stripped = stripCodeFence(text);

  try {
    return JSON.parse(stripped);
  } catch {
    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Groq returned a non-JSON response.");
  }
}

function getGroqApiKey() {
  const apiKey = cleanText(process.env.GROQ_API_KEY || process.env.GROK_API_KEY);
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }

  return apiKey;
}

function getGroqClient() {
  const apiKey = getGroqApiKey();

  if (!cachedClient || cachedClientKey !== apiKey) {
    cachedClient = new Groq({
      apiKey,
    });
    cachedClientKey = apiKey;
  }

  return cachedClient;
}

async function generateStructuredResponse(prompt) {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "Return only valid JSON with no markdown and no extra narration.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = cleanText(completion?.choices?.[0]?.message?.content);

  if (!text) {
    throw new Error("Groq response was empty.");
  }

  return parseGroqJson(text);
}

function buildSymptomsPrompt(symptoms) {
  return `
You are a cautious medical triage assistant.
Analyze the reported symptoms and provide educational guidance only.
Do not claim a confirmed diagnosis.

Symptoms:
${JSON.stringify(symptoms)}

Return ONLY valid JSON with this exact shape:
{
  "possibleConditions": [
    {
      "name": "string",
      "probability": "high|medium|low",
      "description": "string"
    }
  ],
  "suggestedMedicines": [
    {
      "name": "string",
      "dosage": "string",
      "purpose": "string",
      "warning": "string (optional)"
    }
  ],
  "doctorType": "string",
  "generalAdvice": ["string"],
  "urgencyLevel": "immediate|soon|routine",
  "disclaimer": "string"
}

Rules:
- possibleConditions: provide 1 to 3 entries.
- urgencyLevel must be one of immediate, soon, routine.
- If symptoms include red flags (for example chest pain, shortness of breath, one-sided weakness, severe confusion), set urgencyLevel to immediate.
- suggestedMedicines should be conservative and general; use an empty array if medicine suggestion is not appropriate.
- Keep advice concise, practical, and safety-first.
- disclaimer must explicitly say this is not a diagnosis.
  `.trim();
}

function buildSideEffectsPrompt(medicineName) {
  return `
You are a medication safety assistant.
Provide educational side-effect guidance for this medicine:
${JSON.stringify(medicineName)}

Return ONLY valid JSON with this exact shape:
{
  "commonSideEffects": [
    {
      "effect": "string",
      "description": "string",
      "severity": "mild|moderate|severe"
    }
  ],
  "seriousSideEffects": [
    {
      "effect": "string",
      "description": "string",
      "whenToSeekHelp": "string"
    }
  ],
  "drugInteractions": [
    {
      "drug": "string",
      "interaction": "string"
    }
  ],
  "precautions": ["string"],
  "disclaimer": "string"
}

Rules:
- Return concise and medically cautious guidance.
- Always include at least one seriousSideEffect entry.
- severity values must be mild, moderate, or severe.
- disclaimer must explicitly say this is general information and not a replacement for professional advice.
  `.trim();
}

function normalizeSymptomsResult(raw) {
  const possibleConditions = (Array.isArray(raw?.possibleConditions) ? raw.possibleConditions : [])
    .map((entry) => ({
      name: cleanText(entry?.name),
      probability: normalizeProbability(entry?.probability),
      description: cleanText(entry?.description),
    }))
    .filter((entry) => entry.name && entry.description)
    .slice(0, 3);

  const suggestedMedicines = (Array.isArray(raw?.suggestedMedicines) ? raw.suggestedMedicines : [])
    .map((entry) => {
      const name = cleanText(entry?.name);
      const dosage = cleanText(entry?.dosage);
      const purpose = cleanText(entry?.purpose);
      const warning = cleanText(entry?.warning);

      if (!name || !dosage || !purpose) {
        return null;
      }

      return warning ? { name, dosage, purpose, warning } : { name, dosage, purpose };
    })
    .filter(Boolean)
    .slice(0, 4);

  const generalAdvice = cleanTextArray(raw?.generalAdvice, 5);
  const doctorType = cleanText(raw?.doctorType) || "General Physician";
  const urgencyLevel = normalizeUrgency(raw?.urgencyLevel);
  const disclaimer = cleanText(raw?.disclaimer) || SYMPTOM_DISCLAIMER;

  if (possibleConditions.length === 0) {
    possibleConditions.push({
      name: "General Medical Concern",
      probability: "low",
      description: "The symptom pattern is not specific enough for confident matching. Clinical evaluation is recommended if symptoms persist.",
    });
  }

  if (generalAdvice.length === 0) {
    generalAdvice.push("Monitor your symptoms closely and seek medical care if they worsen.");
  }

  return {
    possibleConditions,
    suggestedMedicines,
    doctorType,
    generalAdvice,
    urgencyLevel,
    disclaimer,
  };
}

function normalizeSideEffectsResult(raw) {
  const commonSideEffects = (Array.isArray(raw?.commonSideEffects) ? raw.commonSideEffects : [])
    .map((entry) => ({
      effect: cleanText(entry?.effect),
      description: cleanText(entry?.description),
      severity: normalizeSeverity(entry?.severity),
    }))
    .filter((entry) => entry.effect && entry.description)
    .slice(0, 6);

  const seriousSideEffects = (Array.isArray(raw?.seriousSideEffects) ? raw.seriousSideEffects : [])
    .map((entry) => ({
      effect: cleanText(entry?.effect),
      description: cleanText(entry?.description),
      whenToSeekHelp: cleanText(entry?.whenToSeekHelp),
    }))
    .filter((entry) => entry.effect && entry.description && entry.whenToSeekHelp)
    .slice(0, 5);

  const drugInteractions = (Array.isArray(raw?.drugInteractions) ? raw.drugInteractions : [])
    .map((entry) => ({
      drug: cleanText(entry?.drug),
      interaction: cleanText(entry?.interaction),
    }))
    .filter((entry) => entry.drug && entry.interaction)
    .slice(0, 6);

  const precautions = cleanTextArray(raw?.precautions, 6);
  const disclaimer = cleanText(raw?.disclaimer) || SIDE_EFFECT_DISCLAIMER;

  if (commonSideEffects.length === 0) {
    commonSideEffects.push({
      effect: "Not enough data",
      description: "Specific common side effects could not be confidently generated for this medicine name.",
      severity: "mild",
    });
  }

  if (seriousSideEffects.length === 0) {
    seriousSideEffects.push({
      effect: "Severe allergic reaction",
      description: "Breathing difficulty, facial swelling, or severe rash can be dangerous.",
      whenToSeekHelp: "Seek urgent medical help immediately.",
    });
  }

  if (precautions.length === 0) {
    precautions.push("Use medicine only as directed by your clinician or label instructions.");
  }

  return {
    commonSideEffects,
    seriousSideEffects,
    drugInteractions,
    precautions,
    disclaimer,
  };
}

export async function analyzeSymptomsWithGroq(symptoms) {
  const raw = await generateStructuredResponse(buildSymptomsPrompt(symptoms));
  return normalizeSymptomsResult(raw);
}

export async function analyzeSideEffectsWithGroq(medicineName) {
  const raw = await generateStructuredResponse(buildSideEffectsPrompt(medicineName));
  return normalizeSideEffectsResult(raw);
}
