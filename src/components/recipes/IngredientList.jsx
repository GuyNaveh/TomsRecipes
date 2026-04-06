import React from 'react';
import IngredientRow from './IngredientRow.jsx';
import Button from '../ui/Button.jsx';
import { UNITS } from '../../utils/constants.js';

export default function IngredientList({ ingredients = [], onChange }) {
  function handleChange(index, updated) {
    const next = [...ingredients];
    next[index] = updated;
    onChange(next);
  }

  function handleRemove(index) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onChange([
      ...ingredients,
      { amount: '', unit: UNITS[0], name: '' },
    ]);
  }

  return (
    <div className="flex flex-col gap-2">
      {ingredients.map((ing, idx) => (
        <IngredientRow
          key={idx}
          ingredient={ing}
          onChange={(updated) => handleChange(idx, updated)}
          onRemove={() => handleRemove(idx)}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start mt-1 text-teal-400 hover:text-teal-300"
        onClick={handleAdd}
      >
        + הוסף מצרך
      </Button>
    </div>
  );
}
