
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Player',
  avatar_url TEXT,
  elo INTEGER NOT NULL DEFAULT 1200,
  xp INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  preferred_skin TEXT NOT NULL DEFAULT 'neon',
  preferred_variant TEXT NOT NULL DEFAULT 'american',
  preferred_language TEXT NOT NULL DEFAULT 'en',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- GAMES
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant TEXT NOT NULL DEFAULT 'american',
  mode TEXT NOT NULL DEFAULT 'ai', -- 'ai' | 'pvp' | 'puzzle'
  difficulty TEXT, -- beginner | intermediate | master | guru
  white_player UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  black_player UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  result TEXT, -- 'white' | 'black' | 'draw' | null
  moves JSONB NOT NULL DEFAULT '[]'::jsonb,
  final_position JSONB,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players view their own games" ON public.games FOR SELECT
  USING (auth.uid() = white_player OR auth.uid() = black_player);
CREATE POLICY "Players create games as themselves" ON public.games FOR INSERT
  WITH CHECK (auth.uid() = white_player OR auth.uid() = black_player);
CREATE POLICY "Players update own games" ON public.games FOR UPDATE
  USING (auth.uid() = white_player OR auth.uid() = black_player);

-- ACHIEVEMENTS catalog
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'skin' | 'badge' | 'tournament'
  xp_required INTEGER NOT NULL DEFAULT 0,
  icon TEXT
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements public" ON public.achievements FOR SELECT USING (true);

INSERT INTO public.achievements (id, name, description, category, xp_required, icon) VALUES
  ('skin_neon', 'Neon Pulse', 'Cyber-sport luminous board', 'skin', 0, 'zap'),
  ('skin_emberwood', 'Emberwood', 'Walnut & amber premium board', 'skin', 500, 'flame'),
  ('skin_monoair', 'Mono Air', 'Apple-minimal monochrome board', 'skin', 1200, 'feather'),
  ('skin_ivory', 'Ivory Classic', 'Traditional tournament ivory', 'skin', 2500, 'crown'),
  ('badge_silver_sky', 'Silver Sky Champion', 'Won the Silver Sky tournament', 'badge', 0, 'award'),
  ('badge_first_win', 'First Blood', 'Won your very first game', 'badge', 0, 'star');

-- USER ACHIEVEMENTS
CREATE TABLE public.user_achievements (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User achievements public" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users earn own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TOURNAMENTS
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'american',
  min_elo INTEGER NOT NULL DEFAULT 0,
  max_elo INTEGER NOT NULL DEFAULT 4000,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open', -- open | live | finished
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments public" ON public.tournaments FOR SELECT USING (true);

INSERT INTO public.tournaments (name, variant, min_elo, max_elo) VALUES
  ('Silver Sky Open', 'american', 0, 1600),
  ('Russian Masters', 'russian', 1600, 4000),
  ('Brazilian Carnival', 'brazilian', 1200, 2200),
  ('Canadian Frontier', 'canadian', 1800, 4000);

CREATE TABLE public.tournament_entries (
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tournament_id, user_id)
);
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entries viewable" ON public.tournament_entries FOR SELECT USING (true);
CREATE POLICY "Users join as self" ON public.tournament_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_achievements (user_id, achievement_id) VALUES (NEW.id, 'skin_neon');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
