import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupabaseClient, isSupabaseConfigured } from '../../api/supabase.js';
import { MEAL_SLOTS } from '../../utils/constants.js';
import { formatHebrewDate } from '../../utils/planHelpers.js';
import { sumDailyNutrition } from '../../utils/nutrition.js';
import Spinner from '../ui/Spinner.jsx';

function mapRecipe(r) {
  return { ...r, prepTime: r.prep_time, createdAt: r.created_at, updatedAt: r.updated_at };
}

export default function SharedPlanView() {
  const { token } = useParams();
  const [plan, setPlan] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('unconfigured');
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const supabase = getSupabaseClient();
        const { data: share, error: shareErr } = await supabase
          .from('shares')
          .select('*')
          .eq('token', token)
          .single();
        if (shareErr || !share) throw new Error('תפריט לא נמצא');
        if (share.type !== 'plan' || !share.plan_date) throw new Error('לינק לא תקין');

        const { data: planData, error: planErr } = await supabase
          .from('daily_plans')
          .select('*')
          .eq('user_id', share.owner_id)
          .eq('date', share.plan_date)
          .single();
        if (planErr || !planData) throw new Error('התפריט לא נמצא');

        const meals = planData.meals || [];
        const recipeIds = [...new Set(
          meals.flatMap((m) => [m.recipeId, m.sideDishId].filter(Boolean))
        )];

        let recipeList = [];
        if (recipeIds.length > 0) {
          const { data: recipeData } = await supabase
            .from('recipes')
            .select('*')
            .in('id', recipeIds);
          recipeList = (recipeData || []).map(mapRecipe);
        }

        setPlan({ ...planData, meals });
        setRecipes(recipeList);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (error === 'unconfigured') return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">☁️</p>
        <h2 className="font-heading text-xl text-slate-100 mb-2">Supabase לא מוגדר</h2>
        <p className="text-slate-400 text-sm mb-6">כדי לצפות בתפריט המשותף יש להגדיר Supabase בהגדרות</p>
        <Link to="/" className="text-teal-400 hover:text-teal-300 underline">לדף הבית</Link>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="font-heading text-xl text-slate-100 mb-2">תפריט לא נמצא</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Link to="/" className="text-teal-400 hover:text-teal-300 underline">לדף הבית</Link>
      </div>
    </div>
  );

  const nutrition = sumDailyNutrition(plan.meals, recipes);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-teal-400 text-sm font-medium mb-1">תפריט משותף</p>
          <h1 className="font-heading text-2xl text-slate-100">{formatHebrewDate(plan.date)}</h1>
        </div>

        <div className="bg-card rounded-xl border border-slate-700/50 p-5 mb-4">
          <ul className="flex flex-col gap-3">
            {MEAL_SLOTS.map(({ key, label }) => {
              const meal = plan.meals.find((m) => m.slot === key);
              const recipe = meal?.recipeId ? recipes.find((r) => r.id === meal.recipeId) : null;
              const side = meal?.sideDishId ? recipes.find((r) => r.id === meal.sideDishId) : null;
              return (
                <li key={key} className="flex items-start gap-3">
                  <span className="text-teal-400 text-sm w-20 shrink-0 text-right pt-0.5">{label}</span>
                  <div>
                    <span className={recipe ? 'text-slate-200' : 'text-slate-500'}>
                      {recipe ? recipe.name : 'לא נבחר'}
                    </span>
                    {side && <span className="text-xs text-emerald-400 mr-2">+ {side.name}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-card rounded-xl border border-slate-700/50 p-4 mb-8 flex flex-wrap gap-4 justify-center text-sm">
          <span className="text-amber-400 font-bold">{nutrition.calories} קק"ל</span>
          <span className="text-blue-400">חלבון: {nutrition.protein}ג</span>
          <span className="text-orange-400">פחמימות: {nutrition.carbs}ג</span>
          <span className="text-pink-400">שומן: {nutrition.fat}ג</span>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            צור חשבון משלך ←
          </Link>
        </div>
      </div>
    </div>
  );
}
