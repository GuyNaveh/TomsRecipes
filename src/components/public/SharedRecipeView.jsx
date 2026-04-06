import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupabaseClient, isSupabaseConfigured } from '../../api/supabase.js';
import { TAG_COLOR_MAP, DEFAULT_TAG_COLOR, SIDE_DISH_COLOR } from '../../utils/constants.js';
import Spinner from '../ui/Spinner.jsx';
import TagBadge from '../ui/TagBadge.jsx';
import NutritionBar from '../ui/NutritionBar.jsx';

function mapRecipe(r) {
  return { ...r, prepTime: r.prep_time, createdAt: r.created_at, updatedAt: r.updated_at };
}

export default function SharedRecipeView() {
  const { token } = useParams();
  const [recipe, setRecipe] = useState(null);
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
        if (shareErr || !share) throw new Error('מתכון לא נמצא');
        if (share.type !== 'recipe' || !share.recipe_id) throw new Error('לינק לא תקין');

        const { data: recipeData, error: recipeErr } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', share.recipe_id)
          .single();
        if (recipeErr || !recipeData) throw new Error('המתכון לא נמצא');

        setRecipe(mapRecipe(recipeData));
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
        <p className="text-slate-400 text-sm mb-6">כדי לצפות במתכון המשותף יש להגדיר Supabase בהגדרות</p>
        <Link to="/" className="text-teal-400 hover:text-teal-300 underline">לדף הבית</Link>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="font-heading text-xl text-slate-100 mb-2">מתכון לא נמצא</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Link to="/" className="text-teal-400 hover:text-teal-300 underline">לדף הבית</Link>
      </div>
    </div>
  );

  const { name, type, tags = [], prepTime, servings, ingredients = [], instructions, nutrition } = recipe;
  const typeBadgeClass = type === 'side'
    ? `inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${SIDE_DISH_COLOR}`
    : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-teal-500/20 text-teal-300 border-teal-500/30';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-2">
          <p className="text-teal-400 text-sm font-medium mb-3">מתכון משותף</p>
          <h1 className="font-heading text-3xl text-slate-100 mb-3">{name}</h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className={typeBadgeClass}>{type === 'side' ? 'תוספת' : 'מתכון רגיל'}</span>
            {tags.map((tag) => (
              <TagBadge key={tag} label={tag} colorClass={TAG_COLOR_MAP[tag] || DEFAULT_TAG_COLOR} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-slate-400 my-4">
          {prepTime && <span>⏱ {prepTime.value} {prepTime.unit}</span>}
          {servings && <span>🍽 {servings} מנות</span>}
        </div>

        {nutrition && (
          <div className="bg-card rounded-xl border border-slate-700/50 p-4 mb-4">
            <NutritionBar nutrition={nutrition} />
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="bg-card rounded-xl border border-slate-700/50 p-5 mb-4">
            <h2 className="font-heading text-lg text-slate-100 mb-3">מצרכים</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700/50">
                  <th className="text-right pb-2 font-medium w-16">כמות</th>
                  <th className="text-right pb-2 font-medium w-20">יחידה</th>
                  <th className="text-right pb-2 font-medium">מצרך</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, i) => (
                  <tr key={i} className="border-b border-slate-700/30 last:border-0">
                    <td className="py-1.5 text-slate-300 text-right" dir="ltr">{ing.amount}</td>
                    <td className="py-1.5 text-slate-400 text-right">{ing.unit}</td>
                    <td className="py-1.5 text-slate-200 text-right">{ing.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {instructions && (
          <div className="bg-card rounded-xl border border-slate-700/50 p-5 mb-6">
            <h2 className="font-heading text-lg text-slate-100 mb-3">הוראות הכנה</h2>
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{instructions}</p>
          </div>
        )}

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
