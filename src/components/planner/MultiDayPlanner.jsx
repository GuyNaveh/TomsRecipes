import React, { useEffect, useState } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import DayPlanCard from './DayPlanCard.jsx';
import DailyPlanner from './DailyPlanner.jsx';
import { useDailyPlan } from '../../hooks/useDailyPlan.js';
import { useRecipes } from '../../hooks/useRecipes.js';
import { useSettings } from '../../hooks/useSettings.js';
import { getToday, getDateRange, isToday } from '../../utils/planHelpers.js';
import { isSupabaseConfigured } from '../../api/supabase.js';

export default function MultiDayPlanner() {
  const { plans, loadingPlans, generating, error, loadPlans, generatePlans } = useDailyPlan();
  const { recipes } = useRecipes();
  const { settings } = useSettings();

  const [activePlan, setActivePlan] = useState(null);
  const [numDays, setNumDays] = useState(3);

  // Load plans for today + next 13 days on mount
  useEffect(() => {
    const dates = getDateRange(getToday(), 14);
    loadPlans(dates);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If a plan is active, show DailyPlanner
  if (activePlan) {
    return (
      <DailyPlanner
        date={activePlan}
        onBack={() => setActivePlan(null)}
      />
    );
  }

  const hasApiKey = Boolean(settings.claudeApiKey);
  const showShare = isSupabaseConfigured();

  // Sort plans by date ascending
  const sortedPlans = [...plans].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">תכנון ארוחות</h1>
        <p className="text-sm text-slate-400 mt-1">צור וערוך תפריטים יומיים</p>
      </div>

      {/* Generate section */}
      <Card className="p-4 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-300">יצירת תפריטים חדשים</h2>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400 shrink-0">מספר ימים לתכנון</label>
          <input
            type="number"
            min={1}
            max={14}
            value={numDays}
            onChange={(e) => {
              const val = Math.max(1, Math.min(14, Number(e.target.value)));
              setNumDays(val);
            }}
            className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-colors text-center"
          />
        </div>

        <div className="flex items-center gap-3">
          <div
            title={!hasApiKey ? 'יש להגדיר מפתח Claude בהגדרות' : undefined}
            className="inline-block"
          >
            <Button
              variant="primary"
              size="lg"
              disabled={!hasApiKey || generating}
              loading={generating}
              onClick={() => generatePlans(numDays)}
            >
              {generating ? 'יוצר תפריטים...' : 'צור תפריטים'}
            </Button>
          </div>
          {!hasApiKey && (
            <span className="text-xs text-amber-400">
              יש להגדיר מפתח Claude בהגדרות
            </span>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2 border border-red-800/30">
            {error}
          </p>
        )}
      </Card>

      {/* Plans list */}
      <div className="flex flex-col gap-4">
        {loadingPlans ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sortedPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">
              עדיין אין תפריטים. לחץ &apos;צור תפריטים&apos; כדי להתחיל
            </p>
          </div>
        ) : (
          sortedPlans.map((plan) => (
            <DayPlanCard
              key={plan.date}
              plan={plan}
              recipes={recipes}
              cookNames={settings.cookNames || []}
              isToday={isToday(plan.date)}
              onEdit={(date) => setActivePlan(date)}
              onShare={showShare ? () => {} : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
