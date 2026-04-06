import React from 'react';
import Card from '../ui/Card.jsx';
import { sumDailyNutrition } from '../../utils/nutrition.js';

export default function NutritionSummary({ plan, recipes = [], cookNames = [] }) {
  if (!plan) return null;

  const meals = plan.meals || [];
  const nutrition = sumDailyNutrition(meals, recipes);

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

  // Build display list: configured cooks first, then unassigned
  const cookEntries = cookNames.map((name) => ({
    name,
    count: tally[name] || 0,
  }));

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">סיכום יומי</h3>

      {/* Nutrition */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-teal-400 mb-1">
          {nutrition.calories}
          <span className="text-base font-normal text-slate-400 mr-1">קק"ל</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-slate-800/60 rounded-lg p-2 text-center">
            <div className="text-slate-400 text-xs">חלבון</div>
            <div className="text-slate-100 font-semibold">{nutrition.protein}ג</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2 text-center">
            <div className="text-slate-400 text-xs">פחמימות</div>
            <div className="text-slate-100 font-semibold">{nutrition.carbs}ג</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2 text-center">
            <div className="text-slate-400 text-xs">שומן</div>
            <div className="text-slate-100 font-semibold">{nutrition.fat}ג</div>
          </div>
        </div>
      </div>

      {/* Cook tally */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-1">חלוקת בישול</h4>
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          {cookEntries.map(({ name, count }) => (
            <span key={name} className="bg-slate-800/60 rounded px-2 py-1">
              {name}: <span className="text-teal-400 font-semibold">{count}</span> ארוחות
            </span>
          ))}
          <span className="bg-slate-800/60 rounded px-2 py-1">
            לא שויך: <span className="text-slate-400 font-semibold">{unassigned}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
