import React, { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Toggle from '../ui/Toggle.jsx';
import TagSelector from '../ui/TagSelector.jsx';
import IngredientList from './IngredientList.jsx';
import ImportFreeText from './ImportFreeText.jsx';
import ImportFromUrl from './ImportFromUrl.jsx';
import { analyzeNutrition } from '../../api/claude.js';
import { useSettings } from '../../hooks/useSettings.js';
import { isSupabaseConfigured } from '../../api/supabase.js';
import { UNITS, TIME_UNITS } from '../../utils/constants.js';

const TYPE_OPTIONS = [
  { value: 'regular', label: 'מתכון רגיל' },
  { value: 'side', label: 'תוספת' },
];

function emptyForm() {
  return {
    name: '',
    type: 'regular',
    tags: [],
    prepTime: { value: '', unit: 'דקות' },
    servings: '',
    ingredients: [{ amount: '', unit: UNITS[0], name: '' }],
    instructions: '',
    nutrition: null,
  };
}

function recipeToForm(recipe) {
  return {
    name: recipe.name || '',
    type: recipe.type || 'regular',
    tags: recipe.tags || [],
    prepTime: recipe.prepTime || { value: '', unit: 'דקות' },
    servings: recipe.servings != null ? String(recipe.servings) : '',
    ingredients:
      recipe.ingredients && recipe.ingredients.length > 0
        ? recipe.ingredients
        : [{ amount: '', unit: UNITS[0], name: '' }],
    instructions: recipe.instructions || '',
    nutrition: recipe.nutrition || null,
  };
}

export default function RecipeForm({ recipe = null, onSave, onCancel }) {
  const { settings } = useSettings();
  const apiKey = settings.claudeApiKey || '';
  const supabaseConfigured = isSupabaseConfigured();

  const [form, setForm] = useState(() => (recipe ? recipeToForm(recipe) : emptyForm()));
  const [nutritionInputs, setNutritionInputs] = useState(() => {
    const n = recipe?.nutrition || {};
    return {
      calories: n.calories != null ? String(n.calories) : '',
      protein: n.protein != null ? String(n.protein) : '',
      carbs: n.carbs != null ? String(n.carbs) : '',
      fat: n.fat != null ? String(n.fat) : '',
    };
  });
  const [errors, setErrors] = useState({});
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState(null);

  // Sync nutrition inputs when form nutrition changes (e.g. from import)
  useEffect(() => {
    if (form.nutrition) {
      setNutritionInputs({
        calories: form.nutrition.calories != null ? String(form.nutrition.calories) : '',
        protein: form.nutrition.protein != null ? String(form.nutrition.protein) : '',
        carbs: form.nutrition.carbs != null ? String(form.nutrition.carbs) : '',
        fat: form.nutrition.fat != null ? String(form.nutrition.fat) : '',
      });
    }
  }, [form.nutrition]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'שם המתכון הוא שדה חובה';
    const validIngredients = form.ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) errs.ingredients = 'יש להוסיף לפחות מצרך אחד';
    return errs;
  }

  function handleImport(parsed) {
    // Merge parsed recipe into form fields
    setForm({
      name: parsed.name || '',
      type: parsed.type || 'regular',
      tags: parsed.tags || [],
      prepTime: parsed.prepTime || { value: '', unit: 'דקות' },
      servings: parsed.servings != null ? String(parsed.servings) : '',
      ingredients:
        parsed.ingredients && parsed.ingredients.length > 0
          ? parsed.ingredients
          : [{ amount: '', unit: UNITS[0], name: '' }],
      instructions: parsed.instructions || '',
      nutrition: parsed.nutrition || null,
    });
    setErrors({});
  }

  async function handleAnalyzeNutrition() {
    if (!apiKey) return;
    setNutritionLoading(true);
    setNutritionError(null);
    try {
      const recipeForAnalysis = {
        name: form.name,
        servings: Number(form.servings) || 1,
        ingredients: form.ingredients.filter((i) => i.name.trim()),
      };
      const result = await analyzeNutrition(recipeForAnalysis, apiKey);
      setNutritionInputs({
        calories: result.calories != null ? String(result.calories) : '',
        protein: result.protein != null ? String(result.protein) : '',
        carbs: result.carbs != null ? String(result.carbs) : '',
        fat: result.fat != null ? String(result.fat) : '',
      });
    } catch (err) {
      setNutritionError(err.message || 'שגיאה בניתוח ערכים תזונתיים');
    } finally {
      setNutritionLoading(false);
    }
  }

  function buildNutritionObject() {
    const { calories, protein, carbs, fat } = nutritionInputs;
    if (!calories && !protein && !carbs && !fat) return null;
    return {
      calories: calories ? Number(calories) : null,
      protein: protein ? Number(protein) : null,
      carbs: carbs ? Number(carbs) : null,
      fat: fat ? Number(fat) : null,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const recipeData = {
      name: form.name.trim(),
      type: form.type,
      tags: form.tags,
      prepTime: {
        value: form.prepTime.value ? Number(form.prepTime.value) : null,
        unit: form.prepTime.unit,
      },
      servings: form.servings ? Number(form.servings) : null,
      ingredients: form.ingredients.filter((i) => i.name.trim()),
      instructions: form.instructions.trim(),
      nutrition: buildNutritionObject(),
    };
    if (recipe?.id) {
      recipeData.id = recipe.id;
      recipeData.createdAt = recipe.createdAt;
    }
    onSave(recipeData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 1. Recipe name */}
      <Input
        label="שם המתכון"
        value={form.name}
        onChange={(e) => setField('name', e.target.value)}
        placeholder="לדוגמה: פסטה ברוטב עגבניות"
        error={errors.name}
      />

      {/* 2. Type toggle */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">סוג</label>
        <Toggle
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={(v) => setField('type', v)}
        />
      </div>

      {/* 3. Tags */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">תגיות</label>
        <TagSelector
          selected={form.tags}
          onChange={(tags) => setField('tags', tags)}
        />
      </div>

      {/* 4. Prep time */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">זמן הכנה</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={form.prepTime.value}
            onChange={(e) =>
              setField('prepTime', { ...form.prepTime, value: e.target.value })
            }
            placeholder="כמות"
            min="0"
            dir="ltr"
            className="w-24 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
          />
          <select
            value={form.prepTime.unit}
            onChange={(e) =>
              setField('prepTime', { ...form.prepTime, unit: e.target.value })
            }
            className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
          >
            {TIME_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Servings */}
      <Input
        label="מספר מנות"
        type="number"
        value={form.servings}
        onChange={(e) => setField('servings', e.target.value)}
        placeholder="לדוגמה: 4"
        min="1"
      />

      {/* 6. Ingredients */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">מצרכים</label>
        <IngredientList
          ingredients={form.ingredients}
          onChange={(ings) => setField('ingredients', ings)}
        />
        {errors.ingredients && (
          <span className="text-xs text-red-400">{errors.ingredients}</span>
        )}
      </div>

      {/* 7. Instructions */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">הוראות הכנה</label>
        <textarea
          value={form.instructions}
          onChange={(e) => setField('instructions', e.target.value)}
          placeholder="תאר את שלבי ההכנה..."
          rows={5}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors resize-y text-sm"
        />
      </div>

      {/* 8. Import */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">ייבוא מתכון</label>
        <div className="flex flex-col gap-2">
          <ImportFreeText onImport={handleImport} apiKey={apiKey} />
          {supabaseConfigured && (
            <ImportFromUrl onImport={handleImport} apiKey={apiKey} />
          )}
        </div>
      </div>

      {/* 9. Nutrition */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-300">ערכים תזונתיים (למנה)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">קלוריות</label>
            <input
              type="number"
              value={nutritionInputs.calories}
              onChange={(e) =>
                setNutritionInputs((prev) => ({ ...prev, calories: e.target.value }))
              }
              placeholder="קק&quot;ל"
              min="0"
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">חלבון (גרם)</label>
            <input
              type="number"
              value={nutritionInputs.protein}
              onChange={(e) =>
                setNutritionInputs((prev) => ({ ...prev, protein: e.target.value }))
              }
              placeholder="גרם"
              min="0"
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">פחמימות (גרם)</label>
            <input
              type="number"
              value={nutritionInputs.carbs}
              onChange={(e) =>
                setNutritionInputs((prev) => ({ ...prev, carbs: e.target.value }))
              }
              placeholder="גרם"
              min="0"
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">שומן (גרם)</label>
            <input
              type="number"
              value={nutritionInputs.fat}
              onChange={(e) =>
                setNutritionInputs((prev) => ({ ...prev, fat: e.target.value }))
              }
              placeholder="גרם"
              min="0"
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
            />
          </div>
        </div>
        {nutritionError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
            {nutritionError}
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!apiKey || form.ingredients.filter((i) => i.name.trim()).length === 0}
          loading={nutritionLoading}
          onClick={handleAnalyzeNutrition}
          className="self-start"
        >
          נתח אוטומטית
        </Button>
        {!apiKey && (
          <p className="text-xs text-slate-500">יש להגדיר מפתח Claude בהגדרות לניתוח אוטומטי</p>
        )}
      </div>

      {/* 10. Save / Cancel buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
        <Button type="submit" variant="primary">
          שמור מתכון
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
