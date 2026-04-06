import React, { useState } from 'react';
import { VIEWS } from '../../utils/constants.js';
import NavBar from './NavBar.jsx';
import PageContainer from './PageContainer.jsx';
import RecipeList from '../recipes/RecipeList.jsx';
import MultiDayPlanner from '../planner/MultiDayPlanner.jsx';
import SettingsPage from '../settings/SettingsPage.jsx';

function ViewContent({ view }) {
  switch (view) {
    case VIEWS.RECIPES:
      return <RecipeList />;
    case VIEWS.PLANNER:
      return <MultiDayPlanner />;
    case VIEWS.SETTINGS:
      return <SettingsPage />;
    default:
      return <RecipeList />;
  }
}

export default function AppShell() {
  const [view, setView] = useState(VIEWS.RECIPES);

  return (
    <div className="min-h-screen bg-background">
      <NavBar
        view={view}
        onViewChange={setView}
        storageMode="local"
        user={null}
      />
      <PageContainer>
        <ViewContent view={view} />
      </PageContainer>
    </div>
  );
}
