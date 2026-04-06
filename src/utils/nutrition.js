/**
 * sumDailyNutrition(meals, recipes)
 * meals: array of { recipeId, sideDishId, ... }
 * recipes: full recipes array
 * Returns: { calories, protein, carbs, fat } — rounded integers
 */
export function sumDailyNutrition(meals, recipes) {
  const empty = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  if (!meals || !recipes) return empty;

  const totals = meals.reduce(
    (acc, meal) => {
      const main = recipes.find((r) => r.id === meal.recipeId);
      const side = meal.sideDishId ? recipes.find((r) => r.id === meal.sideDishId) : null;

      const mainNutrition = (main && main.nutrition) ? main.nutrition : empty;
      const sideNutrition = (side && side.nutrition) ? side.nutrition : empty;

      return {
        calories: acc.calories + (mainNutrition.calories || 0) + (sideNutrition.calories || 0),
        protein: acc.protein + (mainNutrition.protein || 0) + (sideNutrition.protein || 0),
        carbs: acc.carbs + (mainNutrition.carbs || 0) + (sideNutrition.carbs || 0),
        fat: acc.fat + (mainNutrition.fat || 0) + (sideNutrition.fat || 0),
      };
    },
    { ...empty }
  );

  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  };
}

/**
 * formatNutrition(n) → "קלוריות: X | חלבון: Xג | פחמימות: Xג | שומן: Xג"
 */
export function formatNutrition(n) {
  if (!n) return '';
  return `קלוריות: ${n.calories} | חלבון: ${n.protein}ג | פחמימות: ${n.carbs}ג | שומן: ${n.fat}ג`;
}
