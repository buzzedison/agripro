-- Admin Users and Knowledge Hub Analytics Database Schema

-- Admin Users Table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Hub Signups Table
CREATE TABLE knowledge_hub_signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  signup_source VARCHAR(100), -- e.g., 'newsletter', 'paywall', 'direct'
  user_id UUID, -- Links to Supabase auth.users if they create account
  subscription_status VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT knowledge_hub_signups_email_key UNIQUE (email)
);

-- Article Views Tracking
CREATE TABLE article_views (
  id SERIAL PRIMARY KEY,
  article_id VARCHAR(255) NOT NULL, -- Sanity document ID or slug
  article_type VARCHAR(50) NOT NULL, -- 'insight', 'best_practice', 'research_paper', 'whitepaper'
  article_title VARCHAR(500),
  user_email VARCHAR(255), -- If logged in, otherwise NULL
  user_id UUID, -- Links to Supabase auth.users if logged in
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  view_duration DECIMAL(10,3), -- in seconds with millisecond precision, if tracked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article Analytics Summary (computed periodically)
CREATE TABLE article_analytics (
  id SERIAL PRIMARY KEY,
  article_id VARCHAR(255) NOT NULL UNIQUE,
  article_type VARCHAR(50) NOT NULL,
  article_title VARCHAR(500),
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  average_view_duration DECIMAL(10,3) DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Hub Content Access Table
CREATE TABLE content_access (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL, -- Links to Supabase auth.users
  user_email VARCHAR(255) NOT NULL,
  content_type VARCHAR(50), -- 'insight', 'best_practice', 'research_paper', 'whitepaper'
  content_id VARCHAR(255), -- Sanity document ID
  content_title VARCHAR(500),
  access_granted BOOLEAN DEFAULT FALSE,
  subscription_type VARCHAR(50), -- 'free', 'premium', 'trial'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT content_access_user_content_key UNIQUE (user_id, content_id)
);

-- Create indexes for better performance
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_knowledge_hub_signups_email ON knowledge_hub_signups(email);
CREATE INDEX idx_knowledge_hub_signups_created_at ON knowledge_hub_signups(created_at);
CREATE INDEX idx_article_views_article_id ON article_views(article_id);
CREATE INDEX idx_article_views_user_id ON article_views(user_id);
CREATE INDEX idx_article_views_created_at ON article_views(created_at);
CREATE INDEX idx_article_analytics_article_id ON article_analytics(article_id);
CREATE INDEX idx_content_access_user_id ON content_access(user_id);
CREATE INDEX idx_content_access_content_id ON content_access(content_id);

-- Insert initial admin users
INSERT INTO admin_users (email, first_name, last_name, role) VALUES
('edison@agriprohub.com', 'Edison', 'Admin', 'super_admin'),
('paul@agriprohub.com', 'Paul', 'Admin', 'admin'),
('lawrence@agriprohub.com', 'Lawrence', 'Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = CURRENT_TIMESTAMP;

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables that have updated_at
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_hub_signups_updated_at
    BEFORE UPDATE ON knowledge_hub_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_analytics_updated_at
    BEFORE UPDATE ON article_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_access_updated_at
    BEFORE UPDATE ON content_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
