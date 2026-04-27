-- Migration: Add design_preview_url column to order_items table
-- Description: Restores QR code functionality for design preview on order tracking page
-- Created: 2026-03-05

-- 1. Add the design_preview_url column if it doesn't exist
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS design_preview_url TEXT;

-- 2. Add comment to document the column
COMMENT ON COLUMN order_items.design_preview_url IS 'URL to the design preview image, used for generating QR codes on the order tracking page';

-- 3. Create index for faster queries (optional, but recommended)
CREATE INDEX IF NOT EXISTS idx_order_items_design_preview_url 
ON order_items(design_preview_url);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items' AND column_name = 'design_preview_url';
