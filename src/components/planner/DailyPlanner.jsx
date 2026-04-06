import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import MealSlot from './MealSlot.jsx';
import NutritionSummary from './NutritionSummary.jsx';
import RecipeDetail from '../recipes/RecipeDetail.jsx';
import { MEAL_SLOTS, CLAUDE_MODEL } from '../../utils/constants.js';
import { formatHebrewDate } from '../../utils/planHelpers.js';
import { useDailyPlan } from '../../hooks/useDailyPlan.js';
import { useRecipes } from '../../hooks/useRecipes.js';
import { useSettings } from '../../hooks/useSettings.js';
import { storage } from '../../storage/storage.js';
import { useAppContext } from '../../context/AppContext.jsx';

export default function DailyPlanner({ date, onBack }) {
  const { getPlan, updateMealSlot } = useDailyPlan();
  const { recipes, sideDishes } = useRecipes();
  const { settings } = useSettings();
  const { dispatch } = useAppContext();

  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [regenError, setRegenError] = useState(null);

  const plan = getPlan(date);

  async function handleRegenerate() {
    setConfirmRegen(false);
    setRegenerating(true);
    setRegenError(null);
    try {
      const regularRecipes = recipes.filter((r) => r.type === 'regular');
      // Generate 1 day plan starting from `date`
      // We patch generateDailyPlan by temporarily using date as start
      const rawPlans = await generateDailyPlanForDate(regularRecipes, date, settings.claudeApiKey);
      for (const planData of rawPlans) {
        const normalizedMeals = (planData.meals || []).map((meal) => ({
          ...meal,
          cook: meal.cook || null,
          sideDishId: meal.sideDishId || null,
        }));
        const updatedPlan = { ...planData, date, meals: normalizedMeals };
        const saved = await storage.saveDailyPlan(updatedPlan);
        dispatch({ type: 'UPSERT_PLAN', payload: saved });
      }
    } catch (err) {
      setRegenError(err.message || 'שגיאה ביצירת התפריט');
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <span>→</span>
          <span>חזור</span>
        </button>
        <h2 className="text-base font-semibold text-slate-100">
          {formatHebrewDate(date)}
        </h2>
        <button
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          סגור
        </button>
      </div>

      {/* Meal slots */}
      {plan ? (
        <>
          <div className="flex flex-col gap-3">
            {MEAL_SLOTS.map(({ key, label }) => {
              const meal = (plan.meals || []).find((m) => m.slot === key) || {
                slot: key,
                slotLabel: label,
                recipeId: null,
                sideDishId: null,
                cook: null,
              };
              const recipe = meal.recipeId
                ? recipes.find((r) => r.id === meal.recipeId) || null
                : null;
              return (
                <MealSlot
                  key={key}
                  meal={{ ...meal, slotLabel: label }}
                  recipe={recipe}
                  sideDishes={sideDishes}
                  cookNames={settings.cookNames || []}
                  onUpdate={(updates) => updateMealSlot(date, key, updates)}
                  onViewRecipe={(r) => setViewingRecipe(r)}
                />
              );
            })}
          </div>

          {/* Nutrition summary */}
          <NutritionSummary
            plan={plan}
            recipes={recipes}
            cookNames={settings.cookNames || []}
          />
        </>
      ) : (
        <div className="text-center text-slate-400 py-8">
          אין תפריט לתאריך זה
        </div>
      )}

      {/* Regenerate section */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-700/40">
        {regenError && (
          <p className="text-sm text-red-400">{regenError}</p>
        )}
        {confirmRegen ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">האם לאפס את התפריט היומי?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
              loading={regenerating}
            >
              כן, שנה
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmRegen(false)}
              disabled={regenerating}
            >
              ביטול
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmRegen(true)}
            disabled={regenerating || !settings.claudeApiKey}
            title={!settings.claudeApiKey ? 'יש להגדיר מפתח Claude בהגדרות' : undefined}
          >
            {regenerating ? <Spinner size="sm" /> : null}
            שנה תפריט
          </Button>
        )}
      </div>

      {/* Recipe detail modal */}
      <RecipeDetail
        recipe={viewingRecipe}
        open={Boolean(viewingRecipe)}
        onClose={() => setViewingRecipe(null)}
      />
    </div>
  );
}

// Generate a plan for a specific date (1 day)
async function generateDailyPlanForDate(regularRecipes, date, apiKey) {
  const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

  const systemPrompt = `You are a meal planner. Create a balanced daily meal plan for the given date. Use recipe tags as hints:
  'בוקר' tag → prefer for breakfast slot
  'חטיף' tag → prefer for mid-morning and mid-afternoon slots
  'צהריים' or 'כבד' tag → prefer for lunch slot
  'ערב' tag → prefer for dinner slot
  Return ONLY valid JSON array with no additional text.

Each day should have this shape:
{
  "date": "YYYY-MM-DD",
  "meals": [
    { "slot": "slot-key", "slotLabel": "slot label in Hebrew", "recipeId": "recipe-id" }
  ]
}

Available slots: pre-breakfast (לפני הגן), breakfast (בוקר), lunch (צהריים), mid-afternoon (ביניים), dinner (ערב)
Return ONLY a valid JSON array with exactly 1 element.`;

  const recipeList = regularRecipes.map((r) => ({
    id: r.id,
    name: r.name,
    tags: r.tags || [],
    nutrition: r.nutrition || null,
  }));

  const userContent = `Create a 1-day meal plan for date: ${date}.

Available recipes:
${JSON.stringify(recipeList, null, 2)}

For this day, assign recipes to appropriate meal slots. Use the slot keys: pre-breakfast, breakfast, lunch, mid-afternoon, dinner.`;

  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `שגיאת API: ${res.status}`);
  }

  const data = await res.json();
  const text = data.content[0].text;

  // Parse JSON
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch { /* fall through */ }
  }
  try { return JSON.parse(text.trim()); } catch { /* fall through */ }
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch { /* fall through */ }
  }
  throw new Error('שגיאה בפענוח התגובה מ-Claude. נסה שנית.');
}
