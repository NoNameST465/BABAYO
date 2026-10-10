-- =======================================================
-- BABAYO ARMORY SYSTEM - DATABASE SCHEMA SUPABASE
-- =======================================================
-- Jalankan SQL ini di SQL Editor di Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    item_category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    variant TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    addons_details TEXT DEFAULT '',
    note TEXT DEFAULT '',
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';

-- 2. Tabel Katalog Item & Kategori (Catalog)
CREATE TABLE IF NOT EXISTS public.catalog (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT DEFAULT '',
    max_quantity INT DEFAULT 10,
    quantity INT DEFAULT 0,
    price_weapon_only NUMERIC DEFAULT 0,
    price_bundle NUMERIC DEFAULT 0,
    price_unit NUMERIC DEFAULT 0,
    unit_details TEXT DEFAULT '',
    bundle_details TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.catalog ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 0;

-- Turn on Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for Orders
DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

-- Setup RLS Policies for Catalog
DROP POLICY IF EXISTS "Allow public select catalog" ON public.catalog;
CREATE POLICY "Allow public select catalog" ON public.catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert catalog" ON public.catalog;
CREATE POLICY "Allow public insert catalog" ON public.catalog FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update catalog" ON public.catalog;
CREATE POLICY "Allow public update catalog" ON public.catalog FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete catalog" ON public.catalog;
CREATE POLICY "Allow public delete catalog" ON public.catalog FOR DELETE USING (true);

-- Add tables to Realtime without dropping the project's publication.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'catalog'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.catalog;
    END IF;
  END IF;
END $$;
