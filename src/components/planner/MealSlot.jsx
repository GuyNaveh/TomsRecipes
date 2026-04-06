import React from 'react';
import Card from '../ui/Card.jsx';
import { SIDE_DISH_SLOTS } from '../../utils/constants.js';
import SideDishSelector from './SideDishSelector.jsx';
import CookAssigner from './CookAssigner.jsx';

export default function MealSlot({
  meal,
  recipe,
  sideDishes = [],
  cookNames = [],
  onUpdate,
  onViewRecipe,
}) {
  if (!meal) return null;

  const { slot, slotLabel, sideDishId, cook } = meal;
  const showSideDish = SIDE_DISH_SLOTS.includes(slot);

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        {/* Slot label on the right */}
        <div className="shrink-0 text-right">
          <span className="text-xs font-semibold text-teal-400">{slotLabel}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Recipe name */}
          {recipe ? (
            <button
              onClick={() => onViewRecipe && onViewRecipe(recipe)}
              className="text-sm font-medium text-slate-100 hover:text-teal-300 transition-colors text-right w-full truncate block"
            >
              {recipe.name}
            </button>
          ) : (
            <span className="text-sm text-slate-500">לא נבחר</span>
          )}

          {/* Calorie hint */}
          {recipe && recipe.nutrition && (
            <span className="text-xs text-slate-500">
              {Math.round(recipe.nutrition.calories)} קק"ל
            </span>
          )}

          {/* Side dish selector */}
          {showSideDish && (
            <SideDishSelector
              sideDishId={sideDishId}
              sideDishes={sideDishes}
              onChange={(val) => onUpdate && onUpdate({ sideDishId: val })}
            />
          )}

          {/* Cook assigner */}
          <CookAssigner
            cook={cook}
            cookNames={cookNames}
            onChange={(val) => onUpdate && onUpdate({ cook: val })}
          />
        </div>
      </div>
    </Card>
  );
}
