ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);