export const MEAL_SLOTS = [
  { key: 'pre-breakfast', label: 'לפני הגן' },
  { key: 'breakfast', label: 'בוקר' },
  { key: 'lunch', label: 'צהריים' },
  { key: 'mid-afternoon', label: 'ביניים' },
  { key: 'dinner', label: 'ערב' },
];

export const SIDE_DISH_SLOTS = ['lunch', 'dinner'];

export const PRESET_TAGS = [
  { label: 'בוקר', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { label: 'צהריים', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { label: 'ערב', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { label: 'חטיף', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { label: 'קל', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { label: 'כבד', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { label: 'צמחוני', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'ללא גלוטן', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
];

export const TAG_COLOR_MAP = Object.fromEntries(PRESET_TAGS.map(t => [t.label, t.color]));
export const DEFAULT_TAG_COLOR = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
export const SIDE_DISH_COLOR = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

export const UNITS = [
  'כוס', 'כף', 'כפית', 'מ"ל', 'ליטר', 'גרם', 'ק"ג',
  'יחידה', 'חבילה', 'קופסה', 'קורט', 'לפי הטעם',
];

export const TIME_UNITS = ['דקות', 'שעות'];

export const DEFAULT_COOK_NAMES = ['גיא', 'נועה'];

export const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

export const VIEWS = {
  RECIPES: 'recipes',
  PLANNER: 'planner',
  SETTINGS: 'settings',
};
