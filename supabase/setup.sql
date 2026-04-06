-- מתכונן — Supabase Setup
-- הרץ את הקובץ הזה ב-SQL Editor של Supabase כדי להגדיר את כל הטבלאות והמדיניות.
-- Run this file in the Supabase SQL Editor to set up all tables and policies.

-- =====================
-- Extensions
-- =====================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- RECIPES
-- =====================
CREATE TABLE IF NOT EXISTS recipes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('regular', 'side')),
  tags         TEXT[] DEFAULT '{}',
  prep_time    JSONB,
  servings     INTEGER,
  ingredients  JSONB DEFAULT '[]',
  instructions TEXT,
  nutrition    JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes (user_id);
CREATE INDEX IF NOT EXISTS recipes_type_idx    ON recipes (type);

-- =====================
-- DAILY PLANS
-- =====================
CREATE TABLE IF NOT EXISTS daily_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  meals        JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_plans_user_date_idx ON daily_plans (user_id, date);

-- =====================
-- SHARES (link-based sharing)
-- =====================
CREATE TABLE IF NOT EXISTS shares (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL CHECK (type IN ('plan', 'recipe', 'all_recipes')),
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id  UUID REFERENCES recipes(id) ON DELETE CASCADE,
  plan_date  DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS shares_token_idx ON shares (token);

-- =====================
-- INVITATIONS
-- =====================
CREATE TABLE IF NOT EXISTS invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invitations_invitee_email_idx ON invitations (invitee_email);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE recipes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Recipes: own rows
CREATE POLICY "own recipes" ON recipes
  FOR ALL USING (auth.uid() = user_id);

-- Recipes: visible to users who have been invited (accepted invitations)
CREATE POLICY "invited recipes" ON recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invitations
      WHERE invitee_email = auth.email()
        AND inviter_id    = recipes.user_id
        AND status        = 'accepted'
    )
  );

-- Daily plans: own rows only (shared via token through the shares table)
CREATE POLICY "own plans" ON daily_plans
  FOR ALL USING (auth.uid() = user_id);

-- Shares: owner manages their own shares
CREATE POLICY "owner manages shares" ON shares
  FOR ALL USING (auth.uid() = owner_id);

-- Shares: anyone can read a share by its token (token acts as the secret)
CREATE POLICY "public read shares" ON shares
  FOR SELECT USING (true);

-- Invitations: inviter manages their own invitations
CREATE POLICY "inviter manages invitations" ON invitations
  FOR ALL USING (auth.uid() = inviter_id);

-- Invitations: invitee can read invitations addressed to them
CREATE POLICY "invitee reads invitations" ON invitations
  FOR SELECT USING (invitee_email = auth.email());

-- =====================
-- AUTO-UPDATE updated_at
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
