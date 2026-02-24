-- ============================================================
-- GradeOS Supabase Schema Migration
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Student',
    target_sgpa NUMERIC DEFAULT 9.0,
    current_semester INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. SEMESTERS TABLE
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester_number INT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own semesters"
    ON public.semesters FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own semesters"
    ON public.semesters FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own semesters"
    ON public.semesters FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Users can delete their own semesters"
    ON public.semesters FOR DELETE
    USING (auth.uid() = student_id);


-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL DEFAULT 'Untitled Course',
    course_code TEXT NOT NULL DEFAULT 'XXX000',
    acu INT NOT NULL DEFAULT 3,
    grade TEXT NOT NULL DEFAULT 'A',
    gp INT NOT NULL DEFAULT 9,
    cp INT NOT NULL DEFAULT 27,
    ecu INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own courses"
    ON public.courses FOR SELECT
    USING (
        semester_id IN (
            SELECT id FROM public.semesters WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert courses into their semesters"
    ON public.courses FOR INSERT
    WITH CHECK (
        semester_id IN (
            SELECT id FROM public.semesters WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own courses"
    ON public.courses FOR UPDATE
    USING (
        semester_id IN (
            SELECT id FROM public.semesters WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own courses"
    ON public.courses FOR DELETE
    USING (
        semester_id IN (
            SELECT id FROM public.semesters WHERE student_id = auth.uid()
        )
    );
