
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- influencers
CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram',
  category TEXT,
  followers INTEGER NOT NULL DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  country TEXT,
  rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.influencer_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  target_posts INTEGER NOT NULL DEFAULT 0,
  achieved_posts INTEGER NOT NULL DEFAULT 0,
  target_reach BIGINT NOT NULL DEFAULT 0,
  achieved_reach BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.influencer_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL DEFAULT 'post',
  title TEXT,
  content_url TEXT,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  views BIGINT NOT NULL DEFAULT 0,
  engagement INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'delivered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- billboards
CREATE TABLE public.billboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  size TEXT,
  vendor TEXT,
  monthly_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- lcd screens
CREATE TABLE public.lcd_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  resolution TEXT,
  vendor TEXT,
  monthly_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  slot_seconds INTEGER NOT NULL DEFAULT 15,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.lcd_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES public.lcd_screens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 15,
  start_date DATE,
  end_date DATE,
  daily_plays INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- budgets & expenses
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'local',
  category TEXT,
  period DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  allocated NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'influencer',
  payee TEXT NOT NULL,
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE SET NULL,
  billboard_id UUID REFERENCES public.billboards(id) ON DELETE SET NULL,
  screen_id UUID REFERENCES public.lcd_screens(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  invoice_number TEXT,
  due_date DATE,
  paid_date DATE,
  method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['influencers','influencer_targets','influencer_deliveries','billboards','lcd_screens','lcd_videos','budgets','expenses','payments']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "team read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "team write %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "team update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "team delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (true)', t);
    EXECUTE format('CREATE TRIGGER touch_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t);
  END LOOP;
END $$;

-- sample data
INSERT INTO public.influencers (id, name, handle, platform, category, followers, contact_email, country, rate, status) VALUES
 ('11111111-1111-1111-1111-111111111101','Layla Hassan','@laylastyle','instagram','Fashion',420000,'layla@agency.com','UAE',3500,'active'),
 ('11111111-1111-1111-1111-111111111102','Omar Nasser','@omareats','tiktok','Food',780000,'omar@creators.io','UAE',5200,'active'),
 ('11111111-1111-1111-1111-111111111103','Sara Kim','@sarafit','youtube','Fitness',260000,'sara@fitmail.com','Singapore',4100,'active'),
 ('11111111-1111-1111-1111-111111111104','Marco Rossi','@marcodrive','instagram','Automotive',150000,'marco@rossi.it','Italy',2800,'paused'),
 ('11111111-1111-1111-1111-111111111105','Aisha Rahman','@aishabeauty','tiktok','Beauty',930000,'aisha@glow.co','UAE',6400,'active');

INSERT INTO public.influencer_targets (influencer_id, period, target_posts, achieved_posts, target_reach, achieved_reach) VALUES
 ('11111111-1111-1111-1111-111111111101', date_trunc('month', CURRENT_DATE)::date, 8, 6, 900000, 740000),
 ('11111111-1111-1111-1111-111111111102', date_trunc('month', CURRENT_DATE)::date, 6, 6, 1500000, 1720000),
 ('11111111-1111-1111-1111-111111111103', date_trunc('month', CURRENT_DATE)::date, 4, 2, 500000, 240000),
 ('11111111-1111-1111-1111-111111111105', date_trunc('month', CURRENT_DATE)::date, 10, 9, 2000000, 2450000),
 ('11111111-1111-1111-1111-111111111101', (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::date, 8, 8, 850000, 910000);

INSERT INTO public.influencer_deliveries (influencer_id, content_type, title, content_url, delivery_date, views, engagement, status) VALUES
 ('11111111-1111-1111-1111-111111111101','reel','Spring capsule haul','https://instagram.com/p/spring1', CURRENT_DATE - 4, 182000, 9400,'delivered'),
 ('11111111-1111-1111-1111-111111111102','video','Street food tour ep.4','https://tiktok.com/@omareats/1', CURRENT_DATE - 9, 640000, 51000,'delivered'),
 ('11111111-1111-1111-1111-111111111103','video','30 day challenge intro','https://youtube.com/watch?v=abc', CURRENT_DATE - 2, 96000, 5100,'pending_review'),
 ('11111111-1111-1111-1111-111111111105','story','Glow routine takeover','https://tiktok.com/@aishabeauty/2', CURRENT_DATE - 1, 410000, 33000,'delivered'),
 ('11111111-1111-1111-1111-111111111105','post','Summer product drop','https://tiktok.com/@aishabeauty/3', CURRENT_DATE - 15, 288000, 20500,'delivered');

INSERT INTO public.billboards (id, name, location, city, size, vendor, monthly_rate, start_date, end_date, status) VALUES
 ('22222222-2222-2222-2222-222222222201','SZR Gateway','Sheikh Zayed Rd, Exit 41','Dubai','12x6m','BrightMedia',48000, CURRENT_DATE - 40, CURRENT_DATE + 50,'active'),
 ('22222222-2222-2222-2222-222222222202','Airport Approach','Terminal 3 Access Rd','Dubai','9x4m','SkyAds',32000, CURRENT_DATE - 120, CURRENT_DATE - 10,'expired'),
 ('22222222-2222-2222-2222-222222222203','Corniche East','Corniche Rd East','Abu Dhabi','15x5m','BrightMedia',54000, CURRENT_DATE - 15, CURRENT_DATE + 75,'active'),
 ('22222222-2222-2222-2222-222222222204','Ring Road North','Ring Rd, Sector 7','Riyadh','10x5m','Najd Outdoor',29000, CURRENT_DATE - 200, CURRENT_DATE - 80,'expired');

INSERT INTO public.lcd_screens (id, name, location, city, resolution, vendor, monthly_rate, slot_seconds, start_date, end_date, status) VALUES
 ('33333333-3333-3333-3333-333333333301','Mall Atrium LED','Dubai Mall, Atrium','Dubai','3840x2160','ScreenWorks',26000,15, CURRENT_DATE - 20, CURRENT_DATE + 70,'active'),
 ('33333333-3333-3333-3333-333333333302','Metro Concourse','Union Metro Station','Dubai','1920x1080','TransitVision',14500,10, CURRENT_DATE - 60, CURRENT_DATE + 30,'active'),
 ('33333333-3333-3333-3333-333333333303','Marina Tower LCD','Marina Walk Tower B','Dubai','2560x1440','ScreenWorks',18000,20, CURRENT_DATE - 150, CURRENT_DATE - 20,'expired');

INSERT INTO public.lcd_videos (screen_id, title, duration_seconds, start_date, end_date, daily_plays, status) VALUES
 ('33333333-3333-3333-3333-333333333301','Summer Campaign 15s',15, CURRENT_DATE - 18, CURRENT_DATE + 12, 240,'running'),
 ('33333333-3333-3333-3333-333333333301','Brand Anthem 30s',30, CURRENT_DATE - 5, CURRENT_DATE + 25, 120,'running'),
 ('33333333-3333-3333-3333-333333333302','Commuter Promo 10s',10, CURRENT_DATE - 40, CURRENT_DATE - 3, 380,'ended'),
 ('33333333-3333-3333-3333-333333333302','Ramadan Special 20s',20, CURRENT_DATE + 5, CURRENT_DATE + 35, 200,'scheduled');

INSERT INTO public.budgets (id, name, scope, category, period, allocated, currency) VALUES
 ('44444444-4444-4444-4444-444444444401','Local Influencers Q3','local','Influencer', date_trunc('month', CURRENT_DATE)::date, 180000,'USD'),
 ('44444444-4444-4444-4444-444444444402','Local OOH Q3','local','Billboard', date_trunc('month', CURRENT_DATE)::date, 260000,'USD'),
 ('44444444-4444-4444-4444-444444444403','International Digital','international','LCD', date_trunc('month', CURRENT_DATE)::date, 140000,'USD'),
 ('44444444-4444-4444-4444-444444444404','International Influencers','international','Influencer', date_trunc('month', CURRENT_DATE)::date, 95000,'USD');

INSERT INTO public.expenses (budget_id, description, category, amount, expense_date, vendor) VALUES
 ('44444444-4444-4444-4444-444444444401','Layla Hassan April package','Influencer',3500, CURRENT_DATE - 12,'Layla Hassan'),
 ('44444444-4444-4444-4444-444444444401','Aisha Rahman takeover','Influencer',6400, CURRENT_DATE - 6,'Aisha Rahman'),
 ('44444444-4444-4444-4444-444444444402','SZR Gateway monthly','Billboard',48000, CURRENT_DATE - 30,'BrightMedia'),
 ('44444444-4444-4444-4444-444444444402','Corniche East install','Billboard',12000, CURRENT_DATE - 14,'BrightMedia'),
 ('44444444-4444-4444-4444-444444444403','Mall Atrium LED monthly','LCD',26000, CURRENT_DATE - 18,'ScreenWorks'),
 ('44444444-4444-4444-4444-444444444404','Marco Rossi production','Influencer',2800, CURRENT_DATE - 25,'Marco Rossi');

INSERT INTO public.payments (category, payee, influencer_id, billboard_id, screen_id, amount, invoice_number, due_date, paid_date, method, status) VALUES
 ('influencer','Layla Hassan','11111111-1111-1111-1111-111111111101',NULL,NULL,3500,'INV-1041', CURRENT_DATE + 8, NULL,'bank_transfer','pending'),
 ('influencer','Aisha Rahman','11111111-1111-1111-1111-111111111105',NULL,NULL,6400,'INV-1042', CURRENT_DATE + 3, NULL,'bank_transfer','approved'),
 ('influencer','Omar Nasser','11111111-1111-1111-1111-111111111102',NULL,NULL,5200,'INV-1030', CURRENT_DATE - 10, CURRENT_DATE - 8,'bank_transfer','paid'),
 ('billboard','BrightMedia',NULL,'22222222-2222-2222-2222-222222222201',NULL,48000,'BM-2211', CURRENT_DATE + 12, NULL,'bank_transfer','approved'),
 ('billboard','BrightMedia',NULL,'22222222-2222-2222-2222-222222222203',NULL,54000,'BM-2212', CURRENT_DATE + 20, NULL,'bank_transfer','pending'),
 ('billboard','SkyAds',NULL,'22222222-2222-2222-2222-222222222202',NULL,32000,'SA-9087', CURRENT_DATE - 30, CURRENT_DATE - 27,'cheque','paid'),
 ('lcd','ScreenWorks',NULL,NULL,'33333333-3333-3333-3333-333333333301',26000,'SW-5501', CURRENT_DATE + 6, NULL,'bank_transfer','pending'),
 ('lcd','TransitVision',NULL,NULL,'33333333-3333-3333-3333-333333333302',14500,'TV-3320', CURRENT_DATE - 5, CURRENT_DATE - 4,'bank_transfer','paid'),
 ('other','Creative Studio LLC',NULL,NULL,NULL,9800,'CS-118', CURRENT_DATE + 15, NULL,'bank_transfer','pending');
