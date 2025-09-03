-- Create admin user manually
-- Run this in your Supabase SQL editor

-- Create the admin_users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert or update admin users
INSERT INTO admin_users (email, first_name, last_name, role, is_active)
VALUES 
  ('edison@agriprohub.com', 'Edison', 'Admin', 'super_admin', true),
  ('paul@agriprohub.com', 'Paul', 'Admin', 'admin', true),
  ('lawrence@agriprohub.com', 'Lawrence', 'Admin', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the users were created
SELECT * FROM admin_users WHERE email IN ('edison@agriprohub.com', 'paul@agriprohub.com', 'lawrence@agriprohub.com');
