import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import Modal from '../ui/Modal.jsx';
import RecipeCard from './RecipeCard.jsx';
import RecipeDetail from './RecipeDetail.jsx';
import RecipeForm from './RecipeForm.jsx';
import { useRecipes } from '../../hooks/useRecipes.js';
import { useSettings } from '../../hooks/useSettings.js';
import { isSupabaseConfigured } from '../../api/supabase.js';

const FILTER_ALL = 'all';
const FILTER_REGULAR = 'regular';
const FILTER_SIDE = 'side';

const FILTER_OPTIONS = [
  { value: FILTER_ALL, label: 'הכל' },
  { value: FILTER_REGULAR, label: 'מתכונים רגילים' },
  { value: FILTER_SIDE, label: 'תוספות' },
];

export default function RecipeList() {
  const { recipes, loading, error, saveRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { settings } = useSettings();
  const apiKey = settings.claudeApiKey || '';
  const supabaseConfigured = isSupabaseConfigured();

  // UI state
  const [filterType, setFilterType] = useState(FILTER_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewRecipe, setViewRecipe] = useState(null);
  const [editRecipe, setEditRecipe] = useState(null); // null = closed, false = new, recipe obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);

  // Filter recipes
  const filtered = recipes.filter((r) => {
    if (filterType === FILTER_REGULAR && r.type !== 'regular') return false;
    if (filterType === FILTER_SIDE && r.type !== 'side') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const nameMatch = r.name?.toLowerCase().includes(q);
      const tagMatch = (r.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!nameMatch && !tagMatch) return false;
    }
    return true;
  });

  async function handleSave(recipeData) {
    setSaveLoading(true);
    try {
      if (recipeData.id) {
        await updateRecipe(recipeData);
      } else {
        await saveRecipe(recipeData);
      }
      setEditRecipe(null);
    } catch (err) {
      // Error handled by context / storage
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDelete(recipe) {
    setDeleteLoading(true);
    try {
      await deleteRecipe(recipe.id);
      setDeleteTarget(null);
      if (viewRecipe?.id === recipe.id) setViewRecipe(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleShare(recipe) {
    setShareTarget(recipe);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-slate-100">המתכונים שלי</h1>
          <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 rounded-full bg-teal-600/20 text-teal-300 text-sm font-medium px-2">
            {recipes.length}
          </span>
        </div>
        <Button
          variant="primary"
          onClick={() => setEditRecipe(false)}
        >
          + הוסף מתכון
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type filter toggle */}
        <div className="inline-flex rounded-lg overflow-hidden border border-slate-600">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filterType === opt.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חיפוש מתכון..."
          className="flex-1 min-w-[160px] bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-5xl">🍽️</span>
          <div className="flex flex-col gap-1">
            <p className="text-slate-300 font-medium">
              {recipes.length === 0
                ? 'עדיין אין מתכונים'
                : 'לא נמצאו מתכונים תואמים'}
            </p>
            <p className="text-sm text-slate-500">
              {recipes.length === 0
                ? 'הוסף את המתכון הראשון שלך!'
                : 'נסה לשנות את החיפוש או הסינון'}
            </p>
          </div>
          {recipes.length === 0 && (
            <Button variant="primary" onClick={() => setEditRecipe(false)}>
              + הוסף מתכון
            </Button>
          )}
        </div>
      )}

      {/* Recipe grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={(r) => setViewRecipe(r)}
              onEdit={(r) => setEditRecipe(r)}
              onDelete={(r) => setDeleteTarget(r)}
              onShare={supabaseConfigured ? handleShare : undefined}
            />
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetail
        recipe={viewRecipe}
        open={Boolean(viewRecipe)}
        onClose={() => setViewRecipe(null)}
        onEdit={(r) => {
          setViewRecipe(null);
          setEditRecipe(r);
        }}
      />

      {/* Add / Edit Recipe Modal */}
      <Modal
        open={editRecipe !== null}
        onClose={() => setEditRecipe(null)}
        title={editRecipe && editRecipe.id ? 'עריכת מתכון' : 'הוספת מתכון'}
        size="lg"
      >
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {editRecipe !== null && (
            <RecipeForm
              recipe={editRecipe || null}
              onSave={handleSave}
              onCancel={() => setEditRecipe(null)}
              loading={saveLoading}
            />
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="מחיקת מתכון"
        size="sm"
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-slate-300 text-sm">
              האם למחוק את המתכון{' '}
              <span className="font-semibold text-slate-100">"{deleteTarget.name}"</span>?
              פעולה זו אינה ניתנת לביטול.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="danger"
                loading={deleteLoading}
                onClick={() => handleDelete(deleteTarget)}
              >
                מחק
              </Button>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                ביטול
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Coming Soon Modal */}
      <Modal
        open={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        title="שיתוף מתכון"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-slate-300 text-sm">שיתוף מתכונים — בקרוב!</p>
          <Button variant="ghost" onClick={() => setShareTarget(null)}>
            סגור
          </Button>
        </div>
      </Modal>
    </div>
  );
}
