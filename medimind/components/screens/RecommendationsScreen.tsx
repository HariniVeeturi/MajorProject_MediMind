import React, { useState, useCallback, useEffect } from 'react';
import { Medication, HealthCondition, Recommendation, RLState, Screen, XAIFeature } from '../../types';
import { getPersonalizedRecommendations } from '../../services/geminiService';
import { recordFeedback, rankRecommendations, loadRLState, getTipLearningStatus, tipKey } from '../../services/rlService';
import { enrichWithXAI } from '../../services/xaiService';
import { SettingsIcon } from '../icons/SettingsIcon';

interface RecommendationsScreenProps {
  medications: Medication[];
  healthConditions: HealthCondition[];
  recommendations: Recommendation[];
  setRecommendations: (recs: Recommendation[]) => void;
  setActiveScreen: (screen: Screen) => void;
}

const STATIC_FALLBACK_TIPS: Recommendation[] = [
  { type: 'diet', title: 'Hydration is Key', description: 'Aim for 6-8 glasses of water a day.', explanation: 'As we age, our sense of thirst can decrease. Staying hydrated helps with digestion and keeps energy levels up.' },
  { type: 'exercise', title: 'Daily Gentle Walk', description: 'Try a 10-15 minute walk around your home or neighborhood.', explanation: 'Walking helps maintain bone density and improves balance, which is vital for preventing falls.' },
];

// XAI Feature Bar
const XAIBar: React.FC<{ feature: XAIFeature }> = ({ feature }) => {
  const isPositive = feature.direction === 'positive';
  const pct = Math.round(feature.contribution * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: isPositive ? '#3b82f6' : '#f59e0b' }} />
      <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{feature.factor}</span>
      <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-400 dark:text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
};

// XAI Panel
const XAIPanel: React.FC<{ features: XAIFeature[] }> = ({ features }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
        <span className="text-base">🧠</span>
        <span>{open ? 'Hide explanation' : 'Why was I shown this?'}</span>
        <span className={`transition-transform text-[10px] ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">Factors from your profile that influenced this recommendation:</p>
          {features.map((f, i) => <XAIBar key={i} feature={f} />)}
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">🔵 Positive factor &nbsp;|&nbsp; 🟡 Requires care</p>
        </div>
      )}
    </div>
  );
};

// Feedback Row
const FeedbackRow: React.FC<{ rec: Recommendation; rlState: RLState; onFeedback: (rec: Recommendation, fb: 'helpful' | 'not_helpful') => void; }> = ({ rec, rlState, onFeedback }) => {
  const current = rec.feedback;
  const learningStatus = getTipLearningStatus(rec, rlState);
  return (
    <div className="mt-3 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5">{learningStatus}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Was this helpful?</span>
        <button onClick={() => onFeedback(rec, 'helpful')} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${current === 'helpful' ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
          👍 Helpful
        </button>
        <button onClick={() => onFeedback(rec, 'not_helpful')} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${current === 'not_helpful' ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
          👎 Not helpful
        </button>
      </div>
    </div>
  );
};

// Recommendation Card
const RecommendationCard: React.FC<{ rec: Recommendation; rlState: RLState; onFeedback: (rec: Recommendation, fb: 'helpful' | 'not_helpful') => void; }> = ({ rec, rlState, onFeedback }) => {
  const isDiet = rec.type === 'diet';
  const icon = isDiet ? '🥗' : '🚶‍♂️';
  const bgColor = isDiet ? 'bg-green-50 dark:bg-green-900/30' : 'bg-orange-50 dark:bg-orange-900/30';
  const textColor = isDiet ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200';
  const borderColor = isDiet ? 'border-green-200 dark:border-green-800' : 'border-orange-200 dark:border-orange-800';
  const bandit = rlState.bandits.find(b => b.tipKey === tipKey(rec));
  const trials = bandit ? bandit.helpfulCount + bandit.notHelpfulCount : 0;
  const helpfulRate = bandit && trials > 0 ? bandit.helpfulCount / trials : null;
  const isLearned = trials >= 2;

  return (
    <div className={`p-4 rounded-xl shadow-sm border ${borderColor} ${bgColor}`}>
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-base ${textColor}`}>{rec.title}</h3>
            {isLearned && helpfulRate !== null && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${helpfulRate >= 0.6 ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                {helpfulRate >= 0.6 ? '⭐ Top tip for you' : 'Less relevant for you'}
              </span>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{rec.description}</p>
          <details className="mt-2 group">
            <summary className="font-semibold text-sm text-blue-600 dark:text-blue-400 cursor-pointer list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform">▶</span> Why this helps
            </summary>
            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{rec.explanation}</p>
          </details>
        </div>
      </div>
      {rec.xaiFeatures && rec.xaiFeatures.length > 0 && <XAIPanel features={rec.xaiFeatures} />}
      <FeedbackRow rec={rec} rlState={rlState} onFeedback={onFeedback} />
    </div>
  );
};

// Main Screen
const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ medications, healthConditions, recommendations, setRecommendations, setActiveScreen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [rlState, setRlState] = useState<RLState>(loadRLState);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    if (recommendations.length === 0) {
      const cached = localStorage.getItem('mediremain_cached_tips');
      const base: Recommendation[] = cached ? JSON.parse(cached) : STATIC_FALLBACK_TIPS;
      const enriched = enrichWithXAI(base, medications, healthConditions);
      setRecommendations(enriched);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecommendations = useCallback(async () => {
    if (isOffline) { setError('You are offline. Showing local tips.'); return; }
    if (medications.length === 0 && healthConditions.length === 0) { setError('Add your medications or health conditions to get personalized tips!'); return; }
    setIsLoading(true); setError(null);
    try {
      const newRecs = await getPersonalizedRecommendations(medications, healthConditions);
      const enriched = enrichWithXAI(newRecs, medications, healthConditions);
      const ranked = rankRecommendations(enriched, rlState);
      setRecommendations(ranked);
      localStorage.setItem('mediremain_cached_tips', JSON.stringify(ranked));
    } catch (err: any) {
      const msg = err?.message || err?.toString() || 'Unknown error';
      setError(`Error: ${msg}`);
      console.error('Recommendation fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [medications, healthConditions, setRecommendations, isOffline, rlState]);

  const handleFeedback = useCallback((rec: Recommendation, feedback: 'helpful' | 'not_helpful') => {
    const updatedRecs = recommendations.map(r => tipKey(r) === tipKey(rec) ? { ...r, feedback } : r);
    const newRlState = recordFeedback(rlState, rec, feedback);
    setRlState(newRlState);
    const reranked = rankRecommendations(updatedRecs, newRlState);
    setRecommendations(reranked);
    localStorage.setItem('mediremain_cached_tips', JSON.stringify(reranked));
  }, [recommendations, rlState, setRecommendations]);

  const dietRecs = recommendations.filter(r => r.type === 'diet');
  const exerciseRecs = recommendations.filter(r => r.type === 'exercise');

  return (
    <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Health Tips</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{isOffline ? 'Offline – Local Data' : 'Online'}</p>
        </div>
        <button onClick={() => setActiveScreen('profile')} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="p-4">
        {/* RL Banner */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 flex gap-3 items-start mb-4">
          <span className="text-xl">🤖</span>
          <div>
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Adaptive AI — Learning from you</p>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
              {rlState.totalFeedbackCount === 0 ? 'Mark tips as helpful or not — the RL model will reorder them to match your preferences.' : `${rlState.totalFeedbackCount} feedback${rlState.totalFeedbackCount > 1 ? 's' : ''} recorded. Tips are ranked by what works best for you.`}
            </p>
          </div>
        </div>

        {error && <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <div className="mb-5">
          <button onClick={fetchRecommendations} disabled={isLoading || isOffline} className={`w-full font-bold py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${isOffline ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
            {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating &amp; ranking…</>) : isOffline ? 'Offline Mode' : ' Refresh health Tips'}
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Personalizing and ranking your tips…</p>
          </div>
        )}

        {!isLoading && recommendations.length > 0 && (
          <div className="space-y-8">
            {dietRecs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">🥗 Healthy Diet</h2>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                </div>
                <div className="space-y-4">{dietRecs.map((rec, i) => <RecommendationCard key={`diet-${i}`} rec={rec} rlState={rlState} onFeedback={handleFeedback} />)}</div>
              </section>
            )}
            {exerciseRecs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">🚶 Safe Exercise</h2>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                </div>
                <div className="space-y-4">{exerciseRecs.map((rec, i) => <RecommendationCard key={`ex-${i}`} rec={rec} rlState={rlState} onFeedback={handleFeedback} />)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsScreen;
