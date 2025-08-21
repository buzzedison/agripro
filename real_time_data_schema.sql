-- Real-time Data Management Extensions
-- Add to existing market_price_analyzer_schema.sql

-- 1. Data Sources Registry Table (Enhanced)
CREATE TABLE IF NOT EXISTS data_source_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- api, websocket, file_upload, manual
    connection_url TEXT,
    api_key_encrypted TEXT, -- Store encrypted API keys
    is_active BOOLEAN DEFAULT true,
    is_realtime BOOLEAN DEFAULT false,
    last_successful_connection TIMESTAMP WITH TIME ZONE,
    connection_frequency_seconds INTEGER DEFAULT 300,
    error_count INTEGER DEFAULT 0,
    max_retry_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Real-time Price Streams Table
CREATE TABLE IF NOT EXISTS realtime_price_streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    data_source_id UUID REFERENCES data_source_connections(id),
    product_id UUID REFERENCES agricultural_products(id),
    market_id UUID REFERENCES markets(id),
    region_id UUID REFERENCES regions(id),
    
    -- Real-time Price Data
    current_price DECIMAL(15, 4) NOT NULL,
    previous_price DECIMAL(15, 4),
    price_change DECIMAL(15, 4),
    price_change_percentage DECIMAL(10, 4),
    
    -- Market Data
    bid_price DECIMAL(15, 4),
    ask_price DECIMAL(15, 4),
    volume_traded DECIMAL(15, 4),
    high_price DECIMAL(15, 4),
    low_price DECIMAL(15, 4),
    
    -- Metadata
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timestamp_received TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    market_session VARCHAR(50), -- pre_market, regular, after_hours, closed
    data_quality_score INTEGER CHECK (data_quality_score >= 1 AND data_quality_score <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Price Alerts Configuration Table
CREATE TABLE IF NOT EXISTS price_alert_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL, -- references auth.users
    product_id UUID REFERENCES agricultural_products(id),
    region_id UUID REFERENCES regions(id),
    
    -- Alert Conditions
    alert_name VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- price_above, price_below, percentage_change, volatility_spike
    threshold_value DECIMAL(15, 4),
    percentage_threshold DECIMAL(10, 4),
    time_window_minutes INTEGER DEFAULT 60,
    
    -- Notification Settings
    notification_channels TEXT[], -- email, sms, push, webhook
    notification_frequency VARCHAR(50) DEFAULT 'immediate', -- immediate, daily_digest, hourly
    is_active BOOLEAN DEFAULT true,
    
    -- Tracking
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Alert Notifications Log Table
CREATE TABLE IF NOT EXISTS alert_notifications_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alert_config_id UUID REFERENCES price_alert_configurations(id),
    user_id UUID NOT NULL,
    
    -- Alert Details
    alert_message TEXT NOT NULL,
    trigger_price DECIMAL(15, 4),
    trigger_condition VARCHAR(100),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notification Status
    notification_channel VARCHAR(50) NOT NULL,
    notification_status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, read
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    notification_read_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional Data
    price_data JSONB, -- Store the price data that triggered the alert
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Historical Data Snapshots Table
CREATE TABLE IF NOT EXISTS price_data_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    snapshot_time TIME NOT NULL,
    
    -- Aggregated Data
    total_records_processed INTEGER,
    data_sources_active INTEGER,
    price_records_created INTEGER,
    alerts_triggered INTEGER,
    
    -- Performance Metrics
    average_latency_ms INTEGER,
    error_count INTEGER,
    data_quality_average DECIMAL(5, 2),
    
    -- Summary Statistics
    price_summary JSONB, -- Min, max, average prices by commodity
    market_activity JSONB, -- Trading volumes, active markets
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. WebSocket Connections Tracking
CREATE TABLE IF NOT EXISTS websocket_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    connection_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID, -- NULL for anonymous connections
    
    -- Connection Details
    source_ip INET,
    user_agent TEXT,
    subscriptions JSONB, -- Array of subscribed commodities/markets
    
    -- Status
    connection_status VARCHAR(50) DEFAULT 'active', -- active, disconnected, error
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    disconnected_at TIMESTAMP WITH TIME ZONE,
    
    -- Metrics
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    connection_duration_seconds INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. API Usage Analytics Table
CREATE TABLE IF NOT EXISTS api_usage_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    api_endpoint VARCHAR(255) NOT NULL,
    request_method VARCHAR(10) NOT NULL,
    
    -- Request Details
    user_id UUID, -- NULL for anonymous requests
    source_ip INET,
    user_agent TEXT,
    request_parameters JSONB,
    
    -- Response Details
    response_status INTEGER,
    response_time_ms INTEGER,
    response_size_bytes INTEGER,
    data_points_returned INTEGER,
    
    -- Categorization
    request_type VARCHAR(50), -- real_data, sample_data, websocket, alert
    data_source VARCHAR(100),
    commodity VARCHAR(100),
    region VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_realtime_price_streams_product_timestamp ON realtime_price_streams(product_id, timestamp_received DESC);
CREATE INDEX idx_realtime_price_streams_market_timestamp ON realtime_price_streams(market_id, timestamp_received DESC);
CREATE INDEX idx_realtime_price_streams_timestamp ON realtime_price_streams(timestamp_received DESC);
CREATE INDEX idx_price_alert_configs_user_active ON price_alert_configurations(user_id, is_active);
CREATE INDEX idx_alert_notifications_user_status ON alert_notifications_log(user_id, notification_status, triggered_at DESC);
CREATE INDEX idx_websocket_connections_status ON websocket_connections(connection_status, last_activity_at DESC);
CREATE INDEX idx_api_usage_endpoint_timestamp ON api_usage_analytics(api_endpoint, created_at DESC);

-- Enable Row Level Security for new tables
ALTER TABLE realtime_price_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alert_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE websocket_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for realtime_price_streams (public read)
CREATE POLICY "Anyone can view realtime price streams" ON realtime_price_streams
    FOR SELECT USING (true);

-- RLS Policies for price_alert_configurations (users can only access their own)
CREATE POLICY "Users can view own alert configurations" ON price_alert_configurations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own alert configurations" ON price_alert_configurations
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for alert_notifications_log (users can only access their own)
CREATE POLICY "Users can view own alert notifications" ON alert_notifications_log
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for websocket_connections (users can only access their own)
CREATE POLICY "Users can view own websocket connections" ON websocket_connections
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- Database Functions for Real-time Operations

-- Function to update price stream with change calculations
CREATE OR REPLACE FUNCTION update_price_stream_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate price changes if there's a previous price
    IF NEW.previous_price IS NOT NULL THEN
        NEW.price_change = NEW.current_price - NEW.previous_price;
        NEW.price_change_percentage = 
            CASE 
                WHEN NEW.previous_price != 0 THEN 
                    ((NEW.current_price - NEW.previous_price) / NEW.previous_price) * 100
                ELSE 0 
            END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic price change calculation
CREATE TRIGGER trigger_update_price_stream_changes 
    BEFORE INSERT OR UPDATE ON realtime_price_streams 
    FOR EACH ROW EXECUTE FUNCTION update_price_stream_changes();

-- Function to check and trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TRIGGER AS $$
DECLARE
    alert_config RECORD;
    alert_message TEXT;
BEGIN
    -- Check all active alert configurations for this product/region
    FOR alert_config IN 
        SELECT * FROM price_alert_configurations 
        WHERE product_id = NEW.product_id 
        AND (region_id = NEW.region_id OR region_id IS NULL)
        AND is_active = true
    LOOP
        -- Check different alert types
        CASE alert_config.alert_type
            WHEN 'price_above' THEN
                IF NEW.current_price > alert_config.threshold_value THEN
                    alert_message := format('Price Alert: %s price reached %s, above your threshold of %s', 
                        (SELECT name FROM agricultural_products WHERE id = NEW.product_id),
                        NEW.current_price, alert_config.threshold_value);
                    PERFORM trigger_alert_notification(alert_config.id, alert_message, NEW.current_price);
                END IF;
            
            WHEN 'price_below' THEN
                IF NEW.current_price < alert_config.threshold_value THEN
                    alert_message := format('Price Alert: %s price dropped to %s, below your threshold of %s',
                        (SELECT name FROM agricultural_products WHERE id = NEW.product_id),
                        NEW.current_price, alert_config.threshold_value);
                    PERFORM trigger_alert_notification(alert_config.id, alert_message, NEW.current_price);
                END IF;
            
            WHEN 'percentage_change' THEN
                IF ABS(NEW.price_change_percentage) > alert_config.percentage_threshold THEN
                    alert_message := format('Price Alert: %s price changed by %s%% to %s',
                        (SELECT name FROM agricultural_products WHERE id = NEW.product_id),
                        NEW.price_change_percentage, NEW.current_price);
                    PERFORM trigger_alert_notification(alert_config.id, alert_message, NEW.current_price);
                END IF;
        END CASE;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger alert notification
CREATE OR REPLACE FUNCTION trigger_alert_notification(
    config_id UUID, 
    message TEXT, 
    trigger_price DECIMAL
)
RETURNS VOID AS $$
DECLARE
    alert_config RECORD;
BEGIN
    -- Get alert configuration
    SELECT * INTO alert_config FROM price_alert_configurations WHERE id = config_id;
    
    -- Insert notification log entry
    INSERT INTO alert_notifications_log (
        alert_config_id, user_id, alert_message, trigger_price, 
        trigger_condition, notification_channel, price_data
    ) VALUES (
        config_id, alert_config.user_id, message, trigger_price,
        alert_config.alert_type, 'email', -- Default to email, can be enhanced
        jsonb_build_object('price', trigger_price, 'timestamp', NOW())
    );
    
    -- Update alert configuration
    UPDATE price_alert_configurations 
    SET last_triggered_at = NOW(), trigger_count = trigger_count + 1
    WHERE id = config_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic alert checking
CREATE TRIGGER trigger_check_price_alerts 
    AFTER INSERT ON realtime_price_streams 
    FOR EACH ROW EXECUTE FUNCTION check_price_alerts();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_data_source_connections_updated_at BEFORE UPDATE ON data_source_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_alert_configurations_updated_at BEFORE UPDATE ON price_alert_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 