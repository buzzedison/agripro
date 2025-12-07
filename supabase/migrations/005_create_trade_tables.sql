-- Trade/GreenMarket Database Migration
-- Creates tables for vendor management with verification system

-- Trade Vendors table - stores vendor applications and approved vendors
CREATE TABLE IF NOT EXISTS public.trade_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional link to user account
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Business Information
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT NOT NULL,
  product_description TEXT NOT NULL,
  sustainability_practices TEXT,
  
  -- Booth/Package preference
  booth_preference TEXT,
  
  -- Branding
  logo_url TEXT,
  cover_image_url TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  
  -- Location
  country TEXT DEFAULT 'Ghana',
  region TEXT,
  city TEXT,
  address TEXT,
  
  -- Verification Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Display & Features
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Stats
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  
  -- SEO
  slug TEXT UNIQUE
);

-- Trade Categories table
CREATE TABLE IF NOT EXISTS public.trade_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade Products table - products listed by approved vendors
CREATE TABLE IF NOT EXISTS public.trade_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.trade_vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.trade_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Product Info
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  unit TEXT, -- e.g., 'per kg', 'per piece', 'per bag'
  min_order_quantity INTEGER DEFAULT 1,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  
  -- Status
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_organic BOOLEAN DEFAULT false,
  
  -- SEO
  slug TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_vendors_status ON public.trade_vendors(status);
CREATE INDEX IF NOT EXISTS idx_trade_vendors_email ON public.trade_vendors(email);
CREATE INDEX IF NOT EXISTS idx_trade_vendors_user_id ON public.trade_vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_vendors_business_type ON public.trade_vendors(business_type);
CREATE INDEX IF NOT EXISTS idx_trade_vendors_is_featured ON public.trade_vendors(is_featured);
CREATE INDEX IF NOT EXISTS idx_trade_vendors_slug ON public.trade_vendors(slug);

CREATE INDEX IF NOT EXISTS idx_trade_products_vendor_id ON public.trade_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_trade_products_category_id ON public.trade_products(category_id);
CREATE INDEX IF NOT EXISTS idx_trade_products_is_active ON public.trade_products(is_active);

-- Enable Row Level Security
ALTER TABLE public.trade_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Approved vendors are viewable by everyone" ON public.trade_vendors;
DROP POLICY IF EXISTS "Users can view own vendor profile" ON public.trade_vendors;
DROP POLICY IF EXISTS "Anyone can insert vendor application" ON public.trade_vendors;
DROP POLICY IF EXISTS "Users can update own vendor profile" ON public.trade_vendors;
DROP POLICY IF EXISTS "Admins can manage all vendors" ON public.trade_vendors;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.trade_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.trade_categories;

DROP POLICY IF EXISTS "Products from approved vendors are viewable" ON public.trade_products;
DROP POLICY IF EXISTS "Vendors can manage own products" ON public.trade_products;

-- RLS Policies for trade_vendors

-- Anyone can view approved vendors
CREATE POLICY "Approved vendors are viewable by everyone" 
  ON public.trade_vendors 
  FOR SELECT 
  USING (status = 'approved');

-- Users can view their own vendor profile regardless of status
CREATE POLICY "Users can view own vendor profile" 
  ON public.trade_vendors 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Anyone can submit a vendor application (even non-authenticated for accessibility)
CREATE POLICY "Anyone can insert vendor application" 
  ON public.trade_vendors 
  FOR INSERT 
  WITH CHECK (true);

-- Users can update their own vendor profile
CREATE POLICY "Users can update own vendor profile" 
  ON public.trade_vendors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for trade_categories

-- Everyone can view active categories
CREATE POLICY "Categories are viewable by everyone" 
  ON public.trade_categories 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for trade_products

-- Products from approved vendors are viewable
CREATE POLICY "Products from approved vendors are viewable" 
  ON public.trade_products 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.trade_vendors 
      WHERE id = vendor_id AND status = 'approved'
    ) AND is_active = true
  );

-- Vendors can manage their own products
CREATE POLICY "Vendors can manage own products" 
  ON public.trade_products 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.trade_vendors 
      WHERE id = vendor_id AND user_id = auth.uid()
    )
  );

-- Function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_vendor_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.business_name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Ensure uniqueness by appending random suffix if needed
    IF EXISTS (SELECT 1 FROM public.trade_vendors WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating slug
DROP TRIGGER IF EXISTS generate_vendor_slug_trigger ON public.trade_vendors;
CREATE TRIGGER generate_vendor_slug_trigger
  BEFORE INSERT OR UPDATE ON public.trade_vendors
  FOR EACH ROW
  EXECUTE FUNCTION generate_vendor_slug();

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_trade_vendors_updated_at ON public.trade_vendors;
CREATE TRIGGER update_trade_vendors_updated_at
  BEFORE UPDATE ON public.trade_vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trade_products_updated_at ON public.trade_products;
CREATE TRIGGER update_trade_products_updated_at
  BEFORE UPDATE ON public.trade_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO public.trade_categories (name, slug, description, icon, display_order) VALUES
  ('Fresh Produce', 'fresh-produce', 'Fresh fruits, vegetables, and herbs directly from farms', '🥬', 1),
  ('Sustainable Products', 'sustainable-products', 'Green and eco-conscious agricultural products', '🌱', 2),
  ('Livestock', 'livestock', 'Poultry, cattle, goats, and other farm animals', '🐄', 3),
  ('Grains & Cereals', 'grains-cereals', 'Rice, maize, wheat, millet, and other grains', '🌾', 4),
  ('Processed Foods', 'processed-foods', 'Value-added agricultural products and packaged foods', '🫙', 5),
  ('Farm Equipment', 'farm-equipment', 'Agricultural tools, machinery, and equipment', '🚜', 6),
  ('Seeds & Seedlings', 'seeds-seedlings', 'Quality seeds, seedlings, and planting materials', '🌰', 7),
  ('Dairy Products', 'dairy-products', 'Fresh milk, cheese, yogurt, and dairy products', '🥛', 8),
  ('Aquaculture', 'aquaculture', 'Fish, shrimp, and other aquatic products', '🐟', 9),
  ('Eco Solutions', 'eco-solutions', 'Sustainable and environmentally friendly products', '♻️', 10)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions
GRANT ALL ON public.trade_vendors TO authenticated;
GRANT SELECT, INSERT ON public.trade_vendors TO anon;

GRANT ALL ON public.trade_categories TO authenticated;
GRANT SELECT ON public.trade_categories TO anon;

GRANT ALL ON public.trade_products TO authenticated;
GRANT SELECT ON public.trade_products TO anon;
