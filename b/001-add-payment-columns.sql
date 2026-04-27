-- Migration: add payment-related columns to orders (safe, uses IF NOT EXISTS where supported)
-- For Supabase/Postgres
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid';

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(100);

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE NULL;

-- For MySQL (alternative) - uncomment if using MySQL
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(100);
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at DATETIME NULL;

-- NOTE: Run the appropriate section for your DB engine. This file is a helper, do not run both sections concurrently.
