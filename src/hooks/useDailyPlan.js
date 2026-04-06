import { useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { useSettings } from './useSettings.js';
import { useRecipes } from './useRecipes.js';
import { generateDailyPlan } from '../api/claude.js';
import { storage } from '../storage/storage.js';

export function useDailyPlan() {
  const { state, dispatch, loadPlans: contextLoadPlans } = useAppContext();
  const { settings } = useSettings();
  const { regularRecipes } = useRecipes();

  const plans = state.dailyPlans;
  const loadingPlans = state.loading.plans;
  const generating = state.loading.generating;
  const error = state.error;

  // Debounce timer refs keyed by date+slot
  const debounceTimers = useRef({});

  const loadPlans = useCallback(
    async (dates) => {
      await contextLoadPlans(dates);
    },
    [contextLoadPlans]
  );

  const generatePlans = useCallback(
    async (numDays) => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'generating', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        const apiKey = settings.claudeApiKey;
        const rawPlans = await generateDailyPlan(regularRecipes, numDays, apiKey);

        for (const planData of rawPlans) {
          // Ensure each meal has cook: null and sideDishId: null if not set
          const normalizedMeals = (planData.meals || []).map((meal) => ({
            ...meal,
            cook: meal.cook || null,
            sideDishId: meal.sideDishId || null,
          }));
          const plan = { ...planData, meals: normalizedMeals };
          const saved = await storage.saveDailyPlan(plan);
          dispatch({ type: 'UPSERT_PLAN', payload: saved });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'שגיאה ביצירת התפריטים' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'generating', value: false } });
      }
    },
    [dispatch, settings.claudeApiKey, regularRecipes]
  );

  const updateMealSlot = useCallback(
    (date, slot, updates) => {
      // Find existing plan
      const plan = state.dailyPlans.find((p) => p.date === date);
      if (!plan) return;

      // Update the specific meal slot immediately in context
      const updatedMeals = (plan.meals || []).map((meal) =>
        meal.slot === slot ? { ...meal, ...updates } : meal
      );
      const updatedPlan = { ...plan, meals: updatedMeals };
      dispatch({ type: 'UPSERT_PLAN', payload: updatedPlan });

      // Debounced save
      const timerKey = `${date}-${slot}`;
      if (debounceTimers.current[timerKey]) {
        clearTimeout(debounceTimers.current[timerKey]);
      }
      debounceTimers.current[timerKey] = setTimeout(async () => {
        try {
          await storage.saveDailyPlan(updatedPlan);
        } catch {
          // silently fail on debounced save
        }
        delete debounceTimers.current[timerKey];
      }, 500);
    },
    [state.dailyPlans, dispatch]
  );

  const getPlan = useCallback(
    (date) => {
      return state.dailyPlans.find((p) => p.date === date) || null;
    },
    [state.dailyPlans]
  );

  return {
    plans,
    loadingPlans,
    generating,
    error,
    loadPlans,
    generatePlans,
    updateMealSlot,
    getPlan,
  };
}
