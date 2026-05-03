/**
 * xaiService.ts
 * =============
 * Implements a lightweight, rule-based Explainable AI (XAI) layer for
 * health recommendations — inspired by SHAP (SHapley Additive exPlanations).
 *
 * How it works:
 *   - Each tip type (diet/exercise) has a set of known contributing factors:
 *     specific medications or conditions that make that tip more/less relevant.
 *   - We compute a normalized contribution score (0–1) for each factor present
 *     in the user's profile.
 *   - These are shown as feature-importance bars in the UI, making the AI's
 *     reasoning transparent ("Why did I get this tip?").
 *
 * This is deterministic and runs fully client-side — no extra API call needed.
 */

import { Medication, HealthCondition, Recommendation, XAIFeature } from '../types';

// ── Rule base ────────────────────────────────────────────────────────────────
// Maps tip keywords → relevant med/condition keywords + their base weight.
// Weights reflect clinical relevance strength (0.4 = moderate, 0.9 = strong).

const DIET_RULES: Array<{ keywords: string[]; factor: string; weight: number; direction: 'positive' | 'negative' }> = [
  { keywords: ['hypertension', 'blood pressure', 'lisinopril', 'amlodipine'], factor: 'Blood pressure condition', weight: 0.9, direction: 'positive' },
  { keywords: ['metformin', 'diabetes', 'glucose', 'insulin'], factor: 'Diabetes/blood sugar', weight: 0.85, direction: 'positive' },
  { keywords: ['cholesterol', 'statin', 'atorvastatin', 'lipitor'], factor: 'Cholesterol level', weight: 0.8, direction: 'positive' },
  { keywords: ['kidney', 'renal', 'furosemide', 'spironolactone'], factor: 'Kidney health', weight: 0.75, direction: 'positive' },
  { keywords: ['vitamin', 'calcium', 'supplement'], factor: 'Nutritional supplement use', weight: 0.5, direction: 'positive' },
  { keywords: ['aspirin', 'warfarin', 'blood thin'], factor: 'Blood-thinning medication', weight: 0.6, direction: 'negative' },
  { keywords: ['obesity', 'overweight', 'bmi'], factor: 'Weight management', weight: 0.7, direction: 'positive' },
];

const EXERCISE_RULES: Array<{ keywords: string[]; factor: string; weight: number; direction: 'positive' | 'negative' }> = [
  { keywords: ['hypertension', 'blood pressure', 'lisinopril'], factor: 'Cardiovascular health', weight: 0.85, direction: 'positive' },
  { keywords: ['diabetes', 'metformin', 'glucose'], factor: 'Blood sugar regulation', weight: 0.8, direction: 'positive' },
  { keywords: ['arthritis', 'joint', 'ibuprofen', 'naproxen'], factor: 'Joint condition', weight: 0.7, direction: 'negative' },
  { keywords: ['osteoporosis', 'bone', 'calcium'], factor: 'Bone density', weight: 0.75, direction: 'positive' },
  { keywords: ['heart', 'cardiac', 'carvedilol', 'beta block'], factor: 'Heart condition', weight: 0.9, direction: 'positive' },
  { keywords: ['depression', 'anxiety', 'ssri', 'sertraline'], factor: 'Mental health', weight: 0.6, direction: 'positive' },
  { keywords: ['copd', 'asthma', 'inhaler', 'respiratory'], factor: 'Respiratory condition', weight: 0.65, direction: 'negative' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function getAllProfileText(medications: Medication[], healthConditions: HealthCondition[]): string {
  const medText = medications.map(m => `${m.name} ${m.dosage}`).join(' ');
  const condText = healthConditions.map(c => c.name).join(' ');
  return `${medText} ${condText}`;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute XAI feature contributions for a recommendation.
 * Returns top factors (max 4) sorted by contribution strength.
 */
export function computeXAIFeatures(
  rec: Recommendation,
  medications: Medication[],
  healthConditions: HealthCondition[]
): XAIFeature[] {
  const rules = rec.type === 'diet' ? DIET_RULES : EXERCISE_RULES;
  const profileText = getAllProfileText(medications, healthConditions);

  const matched: XAIFeature[] = [];

  for (const rule of rules) {
    if (matchesKeywords(profileText, rule.keywords)) {
      matched.push({
        factor: rule.factor,
        contribution: rule.weight,
        direction: rule.direction,
      });
    }
  }

  // Add a baseline factor if nothing matches (generic senior health)
  if (matched.length === 0) {
    matched.push({
      factor: 'General senior wellness',
      contribution: 0.5,
      direction: 'positive',
    });
  }

  // Also add each specific medication as a minor contributing factor
  for (const med of medications.slice(0, 2)) {
    const alreadyCovered = matched.some(f =>
      f.factor.toLowerCase().includes(med.name.toLowerCase())
    );
    if (!alreadyCovered) {
      matched.push({
        factor: `${med.name} (${med.dosage})`,
        contribution: 0.35,
        direction: 'positive',
      });
    }
  }

  // Normalize contributions to max 1.0, sort descending, take top 4
  const maxWeight = Math.max(...matched.map(f => f.contribution));
  return matched
    .map(f => ({ ...f, contribution: f.contribution / maxWeight }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 4);
}

/**
 * Attach XAI features to all recommendations in-place.
 */
export function enrichWithXAI(
  recs: Recommendation[],
  medications: Medication[],
  healthConditions: HealthCondition[]
): Recommendation[] {
  return recs.map(rec => ({
    ...rec,
    xaiFeatures: computeXAIFeatures(rec, medications, healthConditions),
  }));
}
