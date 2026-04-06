import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { formatHebrewDate } from '../../utils/planHelpers.js';
import { sumDailyNutrition } from '../../utils/nutrition.js';
import { isSupabaseConfigured } from '../../api/supabase.js';
import { MEAL_SLOTS } from '../../utils/constants.js';

export default function DayPlanCard({
  plan,
  recipes = [],
  cookNames = [],
  onEdit,
  onShare,
  isToday: isTodayFlag = false,
}) {
  if (!plan) return null;

  const meals = plan.meals || [];
  const nutrition = sumDailyNutrition(meals, recipes);
  const showShare = isSupabaseConfigured() && typeof onShare === 'function';

  // Cook tally
  const tally = {};
  let unassigned = 0;
  for (const meal of meals) {
    if (meal.cook) {
      tally[meal.cook] = (tally[meal.cook] || 0) + 1;
    } else {
      unassigned += 1;
    }
  }

  return (
    <Card className="p-4 flex flex-col gap-3">
      {/* Date header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-100">
            {formatHebrewDate(plan.date)}
          </h3>
          {isTodayFlag && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-teal-600/30 text-teal-300 border border-teal-600/40">
              היום
            </span>
          )}
        </div>
      </div>

      {/* Compact meal list */}
      <ul className="flex flex-col gap-1">
        {MEAL_SLOTS.map(({ key, label }) => {
          const meal = meals.find((m) => m.slot === key);
          const recipe = meal && meal.recipeId
            ? recipes.find((r) => r.id === meal.recipeId)
            : null;
          return (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span className="text-xs text-teal-400 w-16 shrink-0 text-right">{label}</span>
              <span className={recipe ? 'text-slate-200' : 'text-slate-500'}>
                {recipe ? recipe.name : 'לא נבחר'}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Nutrition totals */}
      <div className="text-xs text-slate-400 flex flex-wrap gap-2">
        <span className="text-teal-400 font-semibold">{nutrition.calories} קק"ל</span>
        <span>חלבון: {nutrition.protein}ג</span>
        <span>פחמימות: {nutrition.carbs}ג</span>
        <span>שומן: {nutrition.fat}ג</span>
      </div>

      {/* Cook tally */}
      <div className="text-xs text-slate-500 flex flex-wrap gap-2">
        {cookNames.map((name) => (
          <span key={name}>
            {name}: <span className="text-slate-300">{tally[name] || 0} ארוחות</span>
          </span>
        ))}
        <span>
          לא שויך: <span className="text-slate-300">{unassigned}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-700/40">
        <Button variant="secondary" size="sm" onClick={() => onEdit && onEdit(plan.date)}>
          ערוך
        </Button>
        {showShare && (
          <Button variant="ghost" size="sm" onClick={() => onShare(plan)}>
            שתף
          </Button>
        )}
      </div>
    </Card>
  );
}
