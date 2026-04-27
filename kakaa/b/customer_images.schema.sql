-- Customer Design Images table for Supabase
CREATE TABLE IF NOT EXISTS customer_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) DEFAULT 'Guest',
  url TEXT NOT NULL,
  path VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_customer_images_created_at ON customer_images(created_at DESC);

-- Enable RLS policies (if using Supabase)
ALTER TABLE customer_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read
CREATE POLICY "Allow authenticated to read customer_images"
  ON customer_images
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated admins to insert
CREATE POLICY "Allow authenticated to insert customer_images"
  ON customer_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated admins to delete
CREATE POLICY "Allow authenticated to delete customer_images"
  ON customer_images
  FOR DELETE
  TO authenticated
  USING (true);
