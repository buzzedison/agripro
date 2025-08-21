-- Market Price Analyzer Database Schema
-- Comprehensive schema for tracking agricultural product prices across regions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Agricultural Products Table
CREATE TABLE agricultural_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- crops, livestock, dairy, etc.
    subcategory VARCHAR(100), -- grains, vegetables, fruits, etc.
    unit_of_measurement VARCHAR(50) NOT NULL, -- kg, tons, liters, etc.
    scientific_name VARCHAR(255),
    description TEXT,
    seasonal_pattern JSONB, -- planting/harvesting seasons
    storage_requirements JSONB,
    quality_grades TEXT[], -- premium, standard, low grade
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Geographic Regions Table
CREATE TABLE regions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    city VARCHAR(100),
    region_type VARCHAR(50) NOT NULL, -- country, state, city, market
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population BIGINT,
    economic_indicators JSONB, -- GDP, agricultural contribution, etc.
    climate_zone VARCHAR(100),
    parent_region_id UUID REFERENCES regions(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Markets Table
CREATE TABLE markets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    market_type VARCHAR(100) NOT NULL, -- wholesale, retail, commodity_exchange, farmer_market
    region_id UUID REFERENCES regions(id) NOT NULL,
    address TEXT,
    operating_hours JSONB,
    contact_info JSONB,
    market_size VARCHAR(50), -- large, medium, small
    facilities JSONB, -- storage, processing, transportation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Price Records Table
CREATE TABLE price_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES agricultural_products(id) NOT NULL,
    market_id UUID REFERENCES markets(id) NOT NULL,
    region_id UUID REFERENCES regions(id) NOT NULL,
    price_date DATE NOT NULL,
    price_per_unit DECIMAL(15, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    quality_grade VARCHAR(50),
    quantity_available DECIMAL(15, 4),
    price_type VARCHAR(50) NOT NULL, -- wholesale, retail, farm_gate, spot, futures
    source VARCHAR(100) NOT NULL, -- manual, api, scraping, government
    source_url TEXT,
    reliability_score INTEGER CHECK (reliability_score >= 1 AND reliability_score <= 5),
    notes TEXT,
    created_by UUID, -- user who added the record
    verified_by UUID, -- user who verified the record
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate records for same product, market, date, and price type
    UNIQUE(product_id, market_id, price_date, price_type, quality_grade)
);

-- 5. Price Trends and Analytics Table
CREATE TABLE price_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES agricultural_products(id) NOT NULL,
    region_id UUID REFERENCES regions(id) NOT NULL,
    analysis_date DATE NOT NULL,
    time_period VARCHAR(50) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    
    -- Price Statistics
    avg_price DECIMAL(15, 4),
    min_price DECIMAL(15, 4),
    max_price DECIMAL(15, 4),
    median_price DECIMAL(15, 4),
    price_volatility DECIMAL(10, 6), -- standard deviation
    price_trend VARCHAR(20), -- increasing, decreasing, stable
    trend_percentage DECIMAL(10, 4),
    
    -- Market Insights
    supply_level VARCHAR(20), -- high, medium, low
    demand_level VARCHAR(20), -- high, medium, low
    market_sentiment VARCHAR(20), -- bullish, bearish, neutral
    seasonal_factor DECIMAL(10, 4),
    
    -- Comparative Analysis
    price_vs_historical_avg DECIMAL(10, 4), -- percentage difference
    price_vs_regional_avg DECIMAL(10, 4),
    price_vs_national_avg DECIMAL(10, 4),
    
    -- Predictions
    predicted_price_next_week DECIMAL(15, 4),
    predicted_price_next_month DECIMAL(15, 4),
    prediction_confidence DECIMAL(5, 4), -- 0.0 to 1.0
    
    -- Additional Metadata
    data_points_count INTEGER,
    calculation_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, region_id, analysis_date, time_period)
);

-- 6. Market Alerts Table
CREATE TABLE market_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL, -- references auth.users
    product_id UUID REFERENCES agricultural_products(id) NOT NULL,
    region_id UUID REFERENCES regions(id),
    alert_type VARCHAR(50) NOT NULL, -- price_threshold, trend_change, volatility, supply_shortage
    
    -- Alert Conditions
    threshold_price DECIMAL(15, 4),
    threshold_percentage DECIMAL(10, 4),
    condition_operator VARCHAR(10), -- greater_than, less_than, equals, percentage_change
    
    -- Alert Settings
    is_active BOOLEAN DEFAULT true,
    notification_methods TEXT[], -- email, sms, push, in_app
    frequency VARCHAR(50) DEFAULT 'immediate', -- immediate, daily, weekly
    
    -- Alert History
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Data Sources Table
CREATE TABLE data_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL, -- government, private, exchange, aggregator
    api_endpoint TEXT,
    update_frequency VARCHAR(50), -- real_time, hourly, daily, weekly
    coverage_regions UUID[], -- array of region IDs
    coverage_products UUID[], -- array of product IDs
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    cost_structure VARCHAR(100), -- free, subscription, per_request
    last_sync_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User Watchlists Table
CREATE TABLE user_watchlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL, -- references auth.users
    name VARCHAR(255) NOT NULL,
    description TEXT,
    products UUID[] NOT NULL, -- array of product IDs
    regions UUID[] NOT NULL, -- array of region IDs
    markets UUID[], -- array of market IDs
    alert_settings JSONB,
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_price_records_product_date ON price_records(product_id, price_date DESC);
CREATE INDEX idx_price_records_market_date ON price_records(market_id, price_date DESC);
CREATE INDEX idx_price_records_region_date ON price_records(region_id, price_date DESC);
CREATE INDEX idx_price_records_date ON price_records(price_date DESC);
CREATE INDEX idx_price_analytics_product_region ON price_analytics(product_id, region_id, analysis_date DESC);
CREATE INDEX idx_regions_country ON regions(country);
CREATE INDEX idx_markets_region ON markets(region_id);
CREATE INDEX idx_products_category ON agricultural_products(category, subcategory);

-- Enable Row Level Security
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_records (public read, authenticated write)
CREATE POLICY "Anyone can view price records" ON price_records
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert price records" ON price_records
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own price records" ON price_records
    FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for market_alerts (users can only access their own alerts)
CREATE POLICY "Users can view own alerts" ON market_alerts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own alerts" ON market_alerts
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_watchlists (users can access their own and public watchlists)
CREATE POLICY "Users can view own and public watchlists" ON user_watchlists
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage own watchlists" ON user_watchlists
    FOR ALL USING (user_id = auth.uid());

-- Create Functions for Automatic Updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for Updated At
CREATE TRIGGER update_agricultural_products_updated_at BEFORE UPDATE ON agricultural_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_records_updated_at BEFORE UPDATE ON price_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_analytics_updated_at BEFORE UPDATE ON price_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_alerts_updated_at BEFORE UPDATE ON market_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_watchlists_updated_at BEFORE UPDATE ON user_watchlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 