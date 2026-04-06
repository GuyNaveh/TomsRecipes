import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGate from './components/auth/AuthGate.jsx';
import AppShell from './components/layout/AppShell.jsx';
import SharedPlanView from './components/public/SharedPlanView.jsx';
import SharedRecipeView from './components/public/SharedRecipeView.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGate>
              <AppShell />
            </AuthGate>
          }
        />
        <Route path="/share/plan/:token" element={<SharedPlanView />} />
        <Route path="/share/recipe/:token" element={<SharedRecipeView />} />
      </Routes>
    </BrowserRouter>
  );
}
