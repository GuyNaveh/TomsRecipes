import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

export function useRecipes() {
  const { state, loadRecipes, saveRecipe, updateRecipe, deleteRecipe } = useAppContext();

  const recipes = state.recipes;
  const loading = state.loading.recipes;
  const error = state.error;

  const regularRecipes = useMemo(
    () => recipes.filter((r) => r.type === 'regular'),
    [recipes]
  );

  const sideDishes = useMemo(
    () => recipes.filter((r) => r.type === 'side'),
    [recipes]
  );

  return {
    recipes,
    regularRecipes,
    sideDishes,
    loading,
    error,
    saveRecipe,
    updateRecipe,
    deleteRecipe,
    reload: loadRecipes,
  };
}
