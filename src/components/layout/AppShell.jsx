import React, { useState } from 'react';
import { VIEWS } from '../../utils/constants.js';
import { useSettings } from '../../hooks/useSettings.js';
import { useAuth } from '../../hooks/useAuth.js';
import { storage } from '../../storage/storage.js';
import { AppProvider } from '../../context/AppContext.jsx';
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
  const { settings } = useSettings();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <NavBar
        view={view}
        onViewChange={setView}
        storageMode={storage.getStorageMode()}
        user={user}
        onSignOut={signOut}
      />
      <PageContainer>
        <AppProvider>
          <ViewContent view={view} />
        </AppProvider>
      </PageContainer>
    </div>
  );
}
