
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Business tables
CREATE TABLE public.cloths (
  cloth_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_name TEXT NOT NULL,
  cloth_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloths ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.factories (
  factory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.customers (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.purchases (
  purchase_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_id UUID NOT NULL REFERENCES public.cloths(cloth_id) ON DELETE RESTRICT,
  factory_id UUID NOT NULL REFERENCES public.factories(factory_id) ON DELETE RESTRICT,
  quantity_meter NUMERIC NOT NULL CHECK (quantity_meter > 0),
  cost_per_meter NUMERIC NOT NULL CHECK (cost_per_meter >= 0),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity_meter * cost_per_meter) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sales (
  sale_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_id UUID NOT NULL REFERENCES public.cloths(cloth_id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(customer_id) ON DELETE RESTRICT,
  quantity_meter NUMERIC NOT NULL CHECK (quantity_meter > 0),
  sale_price NUMERIC NOT NULL CHECK (sale_price >= 0),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_revenue NUMERIC GENERATED ALWAYS AS (quantity_meter * sale_price) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- profiles
CREATE POLICY "View own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- user_roles
CREATE POLICY "View own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- master tables: all auth users can SELECT/INSERT, only admins can UPDATE/DELETE
CREATE POLICY "Auth view cloths" ON public.cloths FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert cloths" ON public.cloths FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update cloths" ON public.cloths FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete cloths" ON public.cloths FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth view factories" ON public.factories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert factories" ON public.factories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update factories" ON public.factories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete factories" ON public.factories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update customers" ON public.customers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete customers" ON public.customers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- purchases & sales: any auth user can view/insert
CREATE POLICY "Auth view purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert purchases" ON public.purchases FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth view sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
