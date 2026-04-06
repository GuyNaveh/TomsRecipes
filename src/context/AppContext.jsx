import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { storage } from '../storage/storage.js';

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  recipes: [],
  dailyPlans: [],
  loading: {
    recipes: false,
    plans: false,
    importing: false,
    nutrition: false,
    generating: false,
  },
  error: null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };

    case 'UPSERT_RECIPE': {
      const recipe = action.payload;
      const idx = state.recipes.findIndex((r) => r.id === recipe.id);
      if (idx === -1) {
        return { ...state, recipes: [recipe, ...state.recipes] };
      }
      const updated = [...state.recipes];
      updated[idx] = recipe;
      return { ...state, recipes: updated };
    }

    case 'DELETE_RECIPE':
      return { ...state, recipes: state.recipes.filter((r) => r.id !== action.payload) };

    case 'SET_PLANS':
      return { ...state, dailyPlans: action.payload };

    case 'UPSERT_PLAN': {
      const plan = action.payload;
      const idx = state.dailyPlans.findIndex((p) => p.date === plan.date);
      if (idx === -1) {
        return { ...state, dailyPlans: [...state.dailyPlans, plan] };
      }
      const updated = [...state.dailyPlans];
      updated[idx] = plan;
      return { ...state, dailyPlans: updated };
    }

    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load recipes on mount
  useEffect(() => {
    loadRecipes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRecipes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'recipes', value: true } });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const recipes = await storage.getRecipes();
      dispatch({ type: 'SET_RECIPES', payload: recipes });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'שגיאה בטעינת המתכונים' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'recipes', value: false } });
    }
  }, []);

  const saveRecipe = useCallback(async (recipe) => {
    const saved = await storage.saveRecipe(recipe);
    dispatch({ type: 'UPSERT_RECIPE', payload: saved });
    return saved;
  }, []);

  const updateRecipe = useCallback(async (recipe) => {
    const updated = await storage.updateRecipe(recipe);
    dispatch({ type: 'UPSERT_RECIPE', payload: updated });
    return updated;
  }, []);

  const deleteRecipe = useCallback(async (id) => {
    await storage.deleteRecipe(id);
    dispatch({ type: 'DELETE_RECIPE', payload: id });
  }, []);

  const loadPlans = useCallback(async (dates) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'plans', value: true } });
    try {
      const plans = await storage.getDailyPlans(dates);
      dispatch({ type: 'SET_PLANS', payload: plans });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'שגיאה בטעינת התכניות' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'plans', value: false } });
    }
  }, []);

  const savePlan = useCallback(async (plan) => {
    const saved = await storage.saveDailyPlan(plan);
    dispatch({ type: 'UPSERT_PLAN', payload: saved });
    return saved;
  }, []);

  const value = {
    state,
    dispatch,
    loadRecipes,
    saveRecipe,
    updateRecipe,
    deleteRecipe,
    loadPlans,
    savePlan,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
