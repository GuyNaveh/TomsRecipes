import { CLAUDE_MODEL, MEAL_SLOTS } from '../utils/constants.js';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Helper to call Claude API
async function callClaude(apiKey, systemPrompt, userContent) {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `שגיאת API: ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

// parseClaudeJson: try JSON fence, then raw parse, then throw Hebrew error
function parseClaudeJson(text) {
  // Try JSON code fence first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fall through
    }
  }
  // Try raw parse
  try {
    return JSON.parse(text.trim());
  } catch {
    // Try to find JSON object/array in text
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // fall through
      }
    }
  }
  throw new Error('שגיאה בפענוח התגובה מ-Claude. נסה שנית.');
}

// 1. extractRecipeFromText(rawText, apiKey)
export async function extractRecipeFromText(rawText, apiKey) {
  const systemPrompt = `You are a recipe parser. Extract the recipe from the provided text and return ONLY valid JSON with no additional text or explanation.

Return a JSON object with this exact shape:
{
  "name": "string - recipe name in Hebrew",
  "type": "regular",
  "tags": ["array of relevant Hebrew tags"],
  "prepTime": { "value": number, "unit": "דקות" },
  "servings": number,
  "ingredients": [{ "amount": number_or_string, "unit": "string from units list", "name": "string in Hebrew" }],
  "instructions": "string - preparation instructions in Hebrew",
  "nutrition": null
}

Valid units are: כוס, כף, כפית, מ"ל, ליטר, גרם, ק"ג, יחידה, חבילה, קופסה, קורט, לפי הטעם
If an ingredient unit is not in the list, pick the closest match from the list.
All text fields should be in Hebrew where possible.
Return ONLY valid JSON, no markdown, no explanation.`;

  const text = await callClaude(apiKey, systemPrompt, `Extract the recipe from this text:\n\n${rawText}`);
  return parseClaudeJson(text);
}

// 2. analyzeNutrition(recipe, apiKey)
export async function analyzeNutrition(recipe, apiKey) {
  const systemPrompt = `You are a nutritionist. Analyze the recipe ingredients and return ONLY valid JSON with estimated nutrition per serving. No additional text or explanation.

Return exactly:
{ "calories": number, "protein": number, "carbs": number, "fat": number }

All values should be numbers (integers or decimals). Return ONLY valid JSON.`;

  const ingredientsList = (recipe.ingredients || [])
    .map((ing) => `${ing.amount} ${ing.unit} ${ing.name}`)
    .join('\n');

  const userContent = `Recipe: ${recipe.name}
Servings: ${recipe.servings || 1}

Ingredients:
${ingredientsList}

Estimate nutrition per single serving.`;

  const text = await callClaude(apiKey, systemPrompt, userContent);
  return parseClaudeJson(text);
}

// 3. generateDailyPlan(recipes, numDays, apiKey)
export async function generateDailyPlan(recipes, numDays, apiKey) {
  const systemPrompt = `You are a meal planner. Create balanced daily meal plans. Use recipe tags as hints:
  'בוקר' tag → prefer for breakfast slot
  'חטיף' tag → prefer for mid-morning and mid-afternoon slots
  'צהריים' or 'כבד' tag → prefer for lunch slot
  'ערב' tag → prefer for dinner slot
  Ensure variety: avoid repeating same recipe on consecutive days.
  Return ONLY valid JSON array with no additional text.

Each day should have this shape:
{
  "date": "YYYY-MM-DD",
  "meals": [
    { "slot": "slot-key", "slotLabel": "slot label in Hebrew", "recipeId": "recipe-id" }
  ]
}

Available slots: pre-breakfast (לפני הגן), breakfast (בוקר), lunch (צהריים), mid-afternoon (ביניים), dinner (ערב)
Return ONLY a valid JSON array.`;

  // Build today's date
  const today = new Date();
  const dates = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const recipeList = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    tags: r.tags || [],
    nutrition: r.nutrition || null,
  }));

  const userContent = `Create a ${numDays}-day meal plan starting from ${dates[0]}.

Available recipes:
${JSON.stringify(recipeList, null, 2)}

Dates to plan: ${dates.join(', ')}

For each day, assign recipes to appropriate meal slots. If fewer recipes than needed, repeat with different combinations. Use the slot keys: pre-breakfast, breakfast, lunch, mid-afternoon, dinner.`;

  const text = await callClaude(apiKey, systemPrompt, userContent);
  return parseClaudeJson(text);
}
