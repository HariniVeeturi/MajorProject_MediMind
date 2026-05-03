/**
 * rlService.ts
 * ============
 * Implements an Upper Confidence Bound (UCB1) Multi-Armed Bandit for ranking
 * health recommendations based on user feedback.
 *
 * How it works:
 *   - Each unique tip is treated as an "arm" of the bandit.
 *   - When a user marks a tip as Helpful (+1 reward) or Not Helpful (0 reward),
 *     we update that tip's win/trial counts.
 *   - UCB1 score = average_reward + sqrt(2 * ln(total_trials) / arm_trials)
 *     The exploration bonus ensures rarely-seen tips still get a chance.
 *   - Tips are sorted by UCB1 score so the most preferred tips rise to the top.
 */

import { Recommendation, RLState, TipBanditState } from '../types';

const RL_STORAGE_KEY = 'medimind_rl_state';

// ── Persistence helpers ──────────────────────────────────────────────────────

export function loadRLState(): RLState {
  try {
    const raw = localStorage.getItem(RL_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RLState;
  } catch {}
  return { bandits: [], totalFeedbackCount: 0 };
}

export function saveRLState(state: RLState): void {
  localStorage.setItem(RL_STORAGE_KEY, JSON.stringify(state));
}

// ── Key helpers ──────────────────────────────────────────────────────────────

export function tipKey(rec: Recommendation): string {
  return `${rec.type}::${rec.title}`;
}

function getBandit(state: RLState, key: string): TipBanditState {
  return state.bandits.find(b => b.tipKey === key) ?? {
    tipKey: key,
    helpfulCount: 0,
    notHelpfulCount: 0,
  };
}

// ── UCB1 score ───────────────────────────────────────────────────────────────

function ucb1Score(bandit: TipBanditState, totalTrials: number): number {
  const trials = bandit.helpfulCount + bandit.notHelpfulCount;
  if (trials === 0) return Infinity; // unseen tip gets maximum priority
  const avgReward = bandit.helpfulCount / trials;
  const explorationBonus = Math.sqrt((2 * Math.log(Math.max(totalTrials, 1))) / trials);
  return avgReward + explorationBonus;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Record user feedback for a tip and persist.
 */
export function recordFeedback(
  state: RLState,
  rec: Recommendation,
  feedback: 'helpful' | 'not_helpful'
): RLState {
  const key = tipKey(rec);
  const existing = getBandit(state, key);
  const updated: TipBanditState = {
    ...existing,
    helpfulCount: existing.helpfulCount + (feedback === 'helpful' ? 1 : 0),
    notHelpfulCount: existing.notHelpfulCount + (feedback === 'not_helpful' ? 1 : 0),
  };

  const newBandits = state.bandits.some(b => b.tipKey === key)
    ? state.bandits.map(b => (b.tipKey === key ? updated : b))
    : [...state.bandits, updated];

  const newState: RLState = {
    bandits: newBandits,
    totalFeedbackCount: state.totalFeedbackCount + 1,
  };

  saveRLState(newState);
  return newState;
}

/**
 * Sort recommendations by UCB1 score (highest first).
 * Unseen tips always appear first so new content gets a fair chance.
 */
export function rankRecommendations(
  recs: Recommendation[],
  state: RLState
): Recommendation[] {
  return [...recs].sort((a, b) => {
    const scoreA = ucb1Score(getBandit(state, tipKey(a)), state.totalFeedbackCount);
    const scoreB = ucb1Score(getBandit(state, tipKey(b)), state.totalFeedbackCount);
    return scoreB - scoreA;
  });
}

/**
 * Get a human-readable summary of what the model has learned about a tip.
 */
export function getTipLearningStatus(rec: Recommendation, state: RLState): string {
  const bandit = getBandit(state, tipKey(rec));
  const trials = bandit.helpfulCount + bandit.notHelpfulCount;
  if (trials === 0) return 'New tip — tap feedback to help us learn';
  const pct = Math.round((bandit.helpfulCount / trials) * 100);
  return `You found this helpful ${pct}% of the time (${trials} feedback${trials > 1 ? 's' : ''})`;
}
