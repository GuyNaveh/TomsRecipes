import { getSupabaseClient, isSupabaseConfigured, reinitSupabase } from '../api/supabase.js';

const LS_RECIPES = 'matakon_recipes';
const LS_PLANS = 'matakon_plans';

// ── helpers ──────────────────────────────────────────────────────────────────

function getStorageMode() {
  return isSupabaseConfigured() ? 'supabase' : 'local';
}

// camelCase → snake_case for DB writes
function toDb(recipe) {
  const r = { ...recipe };
  if ('prepTime' in r) { r.prep_time = r.prepTime; delete r.prepTime; }
  if ('createdAt' in r) { r.created_at = r.createdAt; delete r.createdAt; }
  if ('updatedAt' in r) { r.updated_at = r.updatedAt; delete r.updatedAt; }
  if ('userId' in r) { r.user_id = r.userId; delete r.userId; }
  return r;
}

// snake_case → camelCase from DB reads
function fromDb(row) {
  if (!row) return null;
  const r = { ...row };
  if ('prep_time' in r) { r.prepTime = r.prep_time; delete r.prep_time; }
  if ('created_at' in r) { r.createdAt = r.created_at; delete r.created_at; }
  if ('updated_at' in r) { r.updatedAt = r.updated_at; delete r.updated_at; }
  if ('user_id' in r) { r.userId = r.user_id; delete r.user_id; }
  return r;
}

// ── localStorage implementation ───────────────────────────────────────────────

const local = {
  getRecipes() {
    try {
      return JSON.parse(localStorage.getItem(LS_RECIPES)) || [];
    } catch {
      return [];
    }
  },

  saveRecipe(recipe) {
    const recipes = local.getRecipes();
    const now = new Date().toISOString();
    const newRecipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    recipes.push(newRecipe);
    localStorage.setItem(LS_RECIPES, JSON.stringify(recipes));
    return newRecipe;
  },

  updateRecipe(recipe) {
    const recipes = local.getRecipes();
    const idx = recipes.findIndex((r) => r.id === recipe.id);
    if (idx === -1) throw new Error('Recipe not found');
    const updated = { ...recipes[idx], ...recipe, updatedAt: new Date().toISOString() };
    recipes[idx] = updated;
    localStorage.setItem(LS_RECIPES, JSON.stringify(recipes));
    return updated;
  },

  deleteRecipe(id) {
    const recipes = local.getRecipes().filter((r) => r.id !== id);
    localStorage.setItem(LS_RECIPES, JSON.stringify(recipes));
  },

  _getPlans() {
    try {
      return JSON.parse(localStorage.getItem(LS_PLANS)) || [];
    } catch {
      return [];
    }
  },

  getDailyPlan(date) {
    return local._getPlans().find((p) => p.date === date) || null;
  },

  getDailyPlans(dates) {
    const all = local._getPlans();
    return dates.map((d) => all.find((p) => p.date === d) || null).filter(Boolean);
  },

  saveDailyPlan(plan) {
    const plans = local._getPlans();
    const idx = plans.findIndex((p) => p.date === plan.date);
    if (idx === -1) {
      plans.push(plan);
    } else {
      plans[idx] = { ...plans[idx], ...plan };
    }
    localStorage.setItem(LS_PLANS, JSON.stringify(plans));
    return plan;
  },
};

// ── Supabase implementation ───────────────────────────────────────────────────

const remote = {
  async getRecipes() {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  async saveRecipe(recipe) {
    const sb = getSupabaseClient();
    const row = toDb({ ...recipe });
    delete row.id; // let DB generate
    const now = new Date().toISOString();
    row.created_at = now;
    row.updated_at = now;
    const { data, error } = await sb.from('recipes').insert(row).select().single();
    if (error) throw error;
    return fromDb(data);
  },

  async updateRecipe(recipe) {
    const sb = getSupabaseClient();
    const row = toDb({ ...recipe });
    row.updated_at = new Date().toISOString();
    const { id } = recipe;
    delete row.id;
    const { data, error } = await sb
      .from('recipes')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },

  async deleteRecipe(id) {
    const sb = getSupabaseClient();
    const { error } = await sb.from('recipes').delete().eq('id', id);
    if (error) throw error;
  },

  async getDailyPlan(date) {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('daily_plans')
      .select('*')
      .eq('date', date)
      .maybeSingle();
    if (error) throw error;
    return data ? fromDb(data) : null;
  },

  async getDailyPlans(dates) {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('daily_plans')
      .select('*')
      .in('date', dates);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  async saveDailyPlan(plan) {
    const sb = getSupabaseClient();
    const row = toDb({ ...plan });
    const { data, error } = await sb
      .from('daily_plans')
      .upsert(row, { onConflict: 'date' })
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },
};

// ── Unified export ────────────────────────────────────────────────────────────

export const storage = {
  getStorageMode,

  reinitStorage() {
    reinitSupabase();
  },

  async getRecipes() {
    return getStorageMode() === 'supabase'
      ? remote.getRecipes()
      : local.getRecipes();
  },

  async saveRecipe(recipe) {
    return getStorageMode() === 'supabase'
      ? remote.saveRecipe(recipe)
      : local.saveRecipe(recipe);
  },

  async updateRecipe(recipe) {
    return getStorageMode() === 'supabase'
      ? remote.updateRecipe(recipe)
      : local.updateRecipe(recipe);
  },

  async deleteRecipe(id) {
    return getStorageMode() === 'supabase'
      ? remote.deleteRecipe(id)
      : local.deleteRecipe(id);
  },

  async getDailyPlan(date) {
    return getStorageMode() === 'supabase'
      ? remote.getDailyPlan(date)
      : local.getDailyPlan(date);
  },

  async getDailyPlans(dates) {
    return getStorageMode() === 'supabase'
      ? remote.getDailyPlans(dates)
      : local.getDailyPlans(dates);
  },

  async saveDailyPlan(plan) {
    return getStorageMode() === 'supabase'
      ? remote.saveDailyPlan(plan)
      : local.saveDailyPlan(plan);
  },
};
