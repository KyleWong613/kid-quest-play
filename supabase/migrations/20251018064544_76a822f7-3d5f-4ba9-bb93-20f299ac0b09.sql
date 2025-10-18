-- Create profiles table for family accounts
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
  mascot_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children"
  ON public.children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own children"
  ON public.children FOR DELETE
  USING (auth.uid() = user_id);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
  language TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  story_content TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true);

-- Create progress table
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  completed BOOLEAN DEFAULT false,
  completion_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, lesson_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children's progress"
  ON public.progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = progress.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create progress for own children"
  ON public.progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update progress for own children"
  ON public.progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = progress.child_id
      AND children.user_id = auth.uid()
    )
  );

-- Create points table
CREATE TABLE public.points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children's points"
  ON public.points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = points.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage points for own children"
  ON public.points FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = child_id
      AND children.user_id = auth.uid()
    )
  );

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children's badges"
  ON public.badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = badges.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create badges"
  ON public.badges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = child_id
      AND children.user_id = auth.uid()
    )
  );

-- Create function to auto-create points record for new children
CREATE OR REPLACE FUNCTION public.create_points_for_child()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.points (child_id, total_points)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_child_created
  AFTER INSERT ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.create_points_for_child();

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, family_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'family_name', 'Family'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();