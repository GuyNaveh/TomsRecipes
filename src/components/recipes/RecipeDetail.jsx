import React from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import TagBadge from '../ui/TagBadge.jsx';
import NutritionBar from '../ui/NutritionBar.jsx';
import { SIDE_DISH_COLOR } from '../../utils/constants.js';

export default function RecipeDetail({ recipe, open, onClose, onEdit }) {
  if (!recipe) return null;

  const { name, type, tags = [], prepTime, servings, ingredients = [], instructions, nutrition } = recipe;

  const typeBadgeClass =
    type === 'side'
      ? `inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${SIDE_DISH_COLOR}`
      : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-teal-500/20 text-teal-300 border-teal-500/30';

  const typeLabel = type === 'side' ? 'תוספת' : 'מתכון רגיל';

  return (
    <Modal open={open} onClose={onClose} title={name} size="lg">
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Type + tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={typeBadgeClass}>{typeLabel}</span>
          {tags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>

        {/* Meta: prep time + servings */}
        <div className="flex items-center gap-6 text-sm text-slate-400">
          {prepTime && (
            <span>
              ⏱ <span className="text-slate-200">{prepTime.value}</span> {prepTime.unit}
            </span>
          )}
          {servings && (
            <span>
              🍽 <span className="text-slate-200">{servings}</span> מנות
            </span>
          )}
        </div>

        {/* Ingredients table */}
        {ingredients.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">מצרכים</h3>
            <div className="rounded-lg border border-slate-700/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/60">
                    <th className="text-right px-3 py-2 text-slate-400 font-medium w-20">כמות</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium w-24">יחידה</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">שם המצרך</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-3 py-2 text-slate-200 text-left" dir="ltr">
                        {ing.amount}
                      </td>
                      <td className="px-3 py-2 text-slate-300">{ing.unit}</td>
                      <td className="px-3 py-2 text-slate-100 font-medium">{ing.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">הוראות הכנה</h3>
            <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans bg-slate-800/40 rounded-lg p-3 border border-slate-700/30 leading-relaxed">
              {instructions}
            </pre>
          </div>
        )}

        {/* Nutrition */}
        {nutrition && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">ערכים תזונתיים (למנה)</h3>
            <NutritionBar nutrition={nutrition} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit && onEdit(recipe);
            }}
          >
            ✏️ עריכה
          </Button>
          <Button variant="ghost" onClick={onClose}>
            סגור
          </Button>
        </div>
      </div>
    </Modal>
  );
}
