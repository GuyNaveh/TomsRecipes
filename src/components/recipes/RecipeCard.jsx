import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import TagBadge from '../ui/TagBadge.jsx';
import NutritionBar from '../ui/NutritionBar.jsx';
import ShareButton from '../sharing/ShareButton.jsx';
import { SIDE_DISH_COLOR } from '../../utils/constants.js';

const MAX_VISIBLE_TAGS = 3;

export default function RecipeCard({ recipe, onEdit, onDelete, onShare, onView }) {
  const { name, type, tags = [], nutrition, prepTime, servings } = recipe;

  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = tags.length - MAX_VISIBLE_TAGS;

  const typeBadgeClass =
    type === 'side'
      ? `inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${SIDE_DISH_COLOR}`
      : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-teal-500/20 text-teal-300 border-teal-500/30';

  const typeLabel = type === 'side' ? 'תוספת' : 'מתכון רגיל';

  function handleCardClick(e) {
    // Don't trigger view if clicking action buttons
    if (e.target.closest('button')) return;
    onView && onView(recipe);
  }

  return (
    <Card
      className="flex flex-col gap-3 p-4 cursor-pointer hover:border-slate-600 transition-colors"
      onClick={handleCardClick}
    >
      {/* Header: name + type badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-slate-100 text-base leading-snug flex-1 min-w-0 truncate">
          {name}
        </h3>
        <span className={typeBadgeClass}>{typeLabel}</span>
      </div>

      {/* Tags row */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {visibleTags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
          {extraTagCount > 0 && (
            <span className="text-xs text-slate-400">+{extraTagCount}</span>
          )}
        </div>
      )}

      {/* Nutrition bar (compact) */}
      {nutrition && (
        <div className="border-t border-slate-700/50 pt-2">
          <NutritionBar nutrition={nutrition} compact />
        </div>
      )}

      {/* Prep time + servings */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        {prepTime && (
          <span>
            ⏱ {prepTime.value} {prepTime.unit}
          </span>
        )}
        {servings && <span>🍽 {servings} מנות</span>}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-auto pt-1 border-t border-slate-700/30">
        <Button
          size="sm"
          variant="ghost"
          className="text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(recipe);
          }}
        >
          ✏️ עריכה
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-red-400 hover:text-red-300"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(recipe);
          }}
        >
          🗑️ מחיקה
        </Button>
        <ShareButton type="recipe" payload={recipe} className="mr-auto" />
      </div>
    </Card>
  );
}
