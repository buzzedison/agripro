-- Market Price Analyzer Seed Data
-- Sample data for testing and demonstration

-- Insert Agricultural Products
INSERT INTO agricultural_products (id, name, category, subcategory, unit_of_measurement, scientific_name, description, quality_grades) VALUES
-- Crops - Grains
(uuid_generate_v4(), 'Wheat', 'crops', 'grains', 'kg', 'Triticum aestivum', 'Common wheat grain used for flour production', ARRAY['premium', 'standard', 'feed_grade']),
(uuid_generate_v4(), 'Rice', 'crops', 'grains', 'kg', 'Oryza sativa', 'Staple grain crop consumed worldwide', ARRAY['premium', 'standard', 'broken']),
(uuid_generate_v4(), 'Corn (Maize)', 'crops', 'grains', 'kg', 'Zea mays', 'Versatile grain used for food, feed, and industrial purposes', ARRAY['premium', 'standard', 'feed_grade']),
(uuid_generate_v4(), 'Barley', 'crops', 'grains', 'kg', 'Hordeum vulgare', 'Grain used for malting, animal feed, and food', ARRAY['malting', 'feed', 'food_grade']),
(uuid_generate_v4(), 'Oats', 'crops', 'grains', 'kg', 'Avena sativa', 'Nutritious grain used for food and animal feed', ARRAY['premium', 'standard']),

-- Crops - Vegetables
(uuid_generate_v4(), 'Tomatoes', 'crops', 'vegetables', 'kg', 'Solanum lycopersicum', 'Fresh tomatoes for consumption and processing', ARRAY['grade_a', 'grade_b', 'processing']),
(uuid_generate_v4(), 'Onions', 'crops', 'vegetables', 'kg', 'Allium cepa', 'Common cooking vegetable with long storage life', ARRAY['premium', 'standard', 'small']),
(uuid_generate_v4(), 'Potatoes', 'crops', 'vegetables', 'kg', 'Solanum tuberosum', 'Versatile root vegetable for fresh market and processing', ARRAY['table_stock', 'processing', 'seed']),
(uuid_generate_v4(), 'Carrots', 'crops', 'vegetables', 'kg', 'Daucus carota', 'Root vegetable rich in vitamins and minerals', ARRAY['premium', 'standard', 'juice_grade']),
(uuid_generate_v4(), 'Cabbage', 'crops', 'vegetables', 'kg', 'Brassica oleracea', 'Leafy vegetable used fresh and for processing', ARRAY['fresh', 'processing']),

-- Crops - Fruits
(uuid_generate_v4(), 'Apples', 'crops', 'fruits', 'kg', 'Malus domestica', 'Popular fruit for fresh consumption and processing', ARRAY['premium', 'standard', 'juice_grade']),
(uuid_generate_v4(), 'Oranges', 'crops', 'fruits', 'kg', 'Citrus sinensis', 'Citrus fruit rich in vitamin C', ARRAY['premium', 'standard', 'juice']),
(uuid_generate_v4(), 'Bananas', 'crops', 'fruits', 'kg', 'Musa acuminata', 'Tropical fruit with high nutritional value', ARRAY['premium', 'standard', 'overripe']),
(uuid_generate_v4(), 'Grapes', 'crops', 'fruits', 'kg', 'Vitis vinifera', 'Fruit used for fresh consumption and wine production', ARRAY['table_grapes', 'wine_grapes']),

-- Livestock Products
(uuid_generate_v4(), 'Beef Cattle', 'livestock', 'cattle', 'head', 'Bos taurus', 'Cattle raised for meat production', ARRAY['prime', 'choice', 'select']),
(uuid_generate_v4(), 'Dairy Cattle', 'livestock', 'cattle', 'head', 'Bos taurus', 'Cattle raised for milk production', ARRAY['high_yield', 'standard']),
(uuid_generate_v4(), 'Sheep', 'livestock', 'sheep', 'head', 'Ovis aries', 'Sheep raised for meat and wool', ARRAY['prime', 'standard']),
(uuid_generate_v4(), 'Goats', 'livestock', 'goats', 'head', 'Capra aegagrus', 'Goats raised for meat and milk', ARRAY['breeding', 'meat']),
(uuid_generate_v4(), 'Pigs', 'livestock', 'pigs', 'head', 'Sus scrofa', 'Pigs raised for meat production', ARRAY['premium', 'standard']),
(uuid_generate_v4(), 'Chickens', 'livestock', 'poultry', 'head', 'Gallus gallus', 'Chickens raised for meat and eggs', ARRAY['broiler', 'layer']),

-- Dairy Products
(uuid_generate_v4(), 'Milk', 'dairy', 'milk', 'liter', NULL, 'Fresh cow milk for consumption and processing', ARRAY['grade_a', 'grade_b']),
(uuid_generate_v4(), 'Cheese', 'dairy', 'cheese', 'kg', NULL, 'Processed dairy product in various forms', ARRAY['premium', 'standard']),
(uuid_generate_v4(), 'Butter', 'dairy', 'butter', 'kg', NULL, 'Dairy fat product for cooking and consumption', ARRAY['premium', 'standard']),
(uuid_generate_v4(), 'Yogurt', 'dairy', 'yogurt', 'kg', NULL, 'Fermented milk product', ARRAY['premium', 'standard']),

-- Cash Crops
(uuid_generate_v4(), 'Cotton', 'cash_crops', 'fiber', 'kg', 'Gossypium hirsutum', 'Fiber crop used in textile industry', ARRAY['premium', 'standard', 'low_grade']),
(uuid_generate_v4(), 'Coffee Beans', 'cash_crops', 'beverage', 'kg', 'Coffea arabica', 'Coffee beans for beverage production', ARRAY['specialty', 'commercial']),
(uuid_generate_v4(), 'Cocoa Beans', 'cash_crops', 'beverage', 'kg', 'Theobroma cacao', 'Cocoa beans for chocolate production', ARRAY['fine_flavor', 'bulk']),
(uuid_generate_v4(), 'Sugar Cane', 'cash_crops', 'sweetener', 'ton', 'Saccharum officinarum', 'Cane used for sugar production', ARRAY['high_sucrose', 'standard']),
(uuid_generate_v4(), 'Tobacco', 'cash_crops', 'tobacco', 'kg', 'Nicotiana tabacum', 'Tobacco leaves for processing', ARRAY['premium', 'standard']);

-- Insert Regions
INSERT INTO regions (id, name, country, state_province, city, region_type, latitude, longitude, population, climate_zone) VALUES
-- United States
(uuid_generate_v4(), 'United States', 'United States', NULL, NULL, 'country', 39.8283, -98.5795, 331000000, 'temperate'),
(uuid_generate_v4(), 'California', 'United States', 'California', NULL, 'state', 36.7783, -119.4179, 39500000, 'mediterranean'),
(uuid_generate_v4(), 'Texas', 'United States', 'Texas', NULL, 'state', 31.9686, -99.9018, 29000000, 'subtropical'),
(uuid_generate_v4(), 'Iowa', 'United States', 'Iowa', NULL, 'state', 42.0115, -93.2105, 3190000, 'continental'),
(uuid_generate_v4(), 'Florida', 'United States', 'Florida', NULL, 'state', 27.7663, -81.6868, 21500000, 'tropical'),

-- India
(uuid_generate_v4(), 'India', 'India', NULL, NULL, 'country', 20.5937, 78.9629, 1380000000, 'tropical'),
(uuid_generate_v4(), 'Punjab', 'India', 'Punjab', NULL, 'state', 31.1471, 75.3412, 28000000, 'subtropical'),
(uuid_generate_v4(), 'Uttar Pradesh', 'India', 'Uttar Pradesh', NULL, 'state', 26.8467, 80.9462, 200000000, 'subtropical'),
(uuid_generate_v4(), 'Maharashtra', 'India', 'Maharashtra', NULL, 'state', 19.7515, 75.7139, 112000000, 'tropical'),
(uuid_generate_v4(), 'Karnataka', 'India', 'Karnataka', NULL, 'state', 15.3173, 75.7139, 61000000, 'tropical'),

-- Brazil
(uuid_generate_v4(), 'Brazil', 'Brazil', NULL, NULL, 'country', -14.2350, -51.9253, 212000000, 'tropical'),
(uuid_generate_v4(), 'São Paulo', 'Brazil', 'São Paulo', NULL, 'state', -23.5505, -46.6333, 45000000, 'subtropical'),
(uuid_generate_v4(), 'Mato Grosso', 'Brazil', 'Mato Grosso', NULL, 'state', -12.6819, -56.9211, 3500000, 'tropical'),
(uuid_generate_v4(), 'Rio Grande do Sul', 'Brazil', 'Rio Grande do Sul', NULL, 'state', -30.0346, -51.2177, 11400000, 'subtropical'),

-- China
(uuid_generate_v4(), 'China', 'China', NULL, NULL, 'country', 35.8617, 104.1954, 1440000000, 'temperate'),
(uuid_generate_v4(), 'Shandong', 'China', 'Shandong', NULL, 'province', 36.3427, 118.1498, 100000000, 'temperate'),
(uuid_generate_v4(), 'Henan', 'China', 'Henan', NULL, 'province', 33.8818, 113.6140, 94000000, 'temperate'),
(uuid_generate_v4(), 'Heilongjiang', 'China', 'Heilongjiang', NULL, 'province', 47.8620, 127.7615, 32000000, 'continental'),

-- Nigeria
(uuid_generate_v4(), 'Nigeria', 'Nigeria', NULL, NULL, 'country', 9.0820, 8.6753, 206000000, 'tropical'),
(uuid_generate_v4(), 'Kano', 'Nigeria', 'Kano', NULL, 'state', 12.0022, 8.5920, 13000000, 'tropical'),
(uuid_generate_v4(), 'Kaduna', 'Nigeria', 'Kaduna', NULL, 'state', 10.5105, 7.4165, 8000000, 'tropical'),
(uuid_generate_v4(), 'Ogun', 'Nigeria', 'Ogun', NULL, 'state', 7.1608, 3.3566, 5000000, 'tropical'),

-- Kenya
(uuid_generate_v4(), 'Kenya', 'Kenya', NULL, NULL, 'country', -0.0236, 37.9062, 53000000, 'tropical'),
(uuid_generate_v4(), 'Rift Valley', 'Kenya', 'Rift Valley', NULL, 'province', -0.5000, 35.7500, 12000000, 'tropical'),
(uuid_generate_v4(), 'Central', 'Kenya', 'Central', NULL, 'province', -0.7000, 36.8000, 4500000, 'tropical'),

-- Australia
(uuid_generate_v4(), 'Australia', 'Australia', NULL, NULL, 'country', -25.2744, 133.7751, 25000000, 'temperate'),
(uuid_generate_v4(), 'New South Wales', 'Australia', 'New South Wales', NULL, 'state', -31.2532, 146.9211, 8100000, 'temperate'),
(uuid_generate_v4(), 'Victoria', 'Australia', 'Victoria', NULL, 'state', -36.5986, 144.6780, 6600000, 'temperate'),

-- Canada
(uuid_generate_v4(), 'Canada', 'Canada', NULL, NULL, 'country', 56.1304, -106.3468, 38000000, 'continental'),
(uuid_generate_v4(), 'Saskatchewan', 'Canada', 'Saskatchewan', NULL, 'province', 52.9399, -106.4509, 1180000, 'continental'),
(uuid_generate_v4(), 'Alberta', 'Canada', 'Alberta', NULL, 'province', 53.9333, -116.5765, 4400000, 'continental');

-- Insert Markets (sample markets for different regions)
INSERT INTO markets (id, name, market_type, region_id, address, market_size, facilities) VALUES
-- Get region IDs for market insertion
(uuid_generate_v4(), 'Chicago Board of Trade', 'commodity_exchange', 
 (SELECT id FROM regions WHERE name = 'United States' LIMIT 1), 
 '141 W Jackson Blvd, Chicago, IL 60604', 'large', 
 '{"trading_floor": true, "electronic_trading": true, "storage": true}'),

(uuid_generate_v4(), 'Central Valley Produce Market', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'California' LIMIT 1), 
 'Fresno, CA', 'large', 
 '{"cold_storage": true, "loading_docks": true, "processing": true}'),

(uuid_generate_v4(), 'Iowa Grain Terminal', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Iowa' LIMIT 1), 
 'Des Moines, IA', 'medium', 
 '{"grain_elevator": true, "rail_access": true, "truck_loading": true}'),

(uuid_generate_v4(), 'Mumbai Agricultural Market', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Maharashtra' LIMIT 1), 
 'Mumbai, Maharashtra', 'large', 
 '{"auction_hall": true, "storage": true, "processing": true}'),

(uuid_generate_v4(), 'Punjab Grain Market', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Punjab' LIMIT 1), 
 'Ludhiana, Punjab', 'large', 
 '{"grain_storage": true, "milling": true, "transportation": true}'),

(uuid_generate_v4(), 'São Paulo Commodity Exchange', 'commodity_exchange', 
 (SELECT id FROM regions WHERE name = 'São Paulo' LIMIT 1), 
 'São Paulo, SP', 'large', 
 '{"electronic_trading": true, "settlement": true, "storage": true}'),

(uuid_generate_v4(), 'Mato Grosso Soy Terminal', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Mato Grosso' LIMIT 1), 
 'Cuiabá, MT', 'large', 
 '{"grain_elevator": true, "rail_terminal": true, "port_access": true}'),

(uuid_generate_v4(), 'Shandong Vegetable Market', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Shandong' LIMIT 1), 
 'Jinan, Shandong', 'large', 
 '{"cold_storage": true, "distribution": true, "processing": true}'),

(uuid_generate_v4(), 'Kano Grain Market', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Kano' LIMIT 1), 
 'Kano, Nigeria', 'medium', 
 '{"storage": true, "processing": true, "transportation": true}'),

(uuid_generate_v4(), 'Nairobi Commodity Exchange', 'commodity_exchange', 
 (SELECT id FROM regions WHERE name = 'Kenya' LIMIT 1), 
 'Nairobi, Kenya', 'medium', 
 '{"electronic_trading": true, "warehousing": true, "quality_testing": true}'),

(uuid_generate_v4(), 'Melbourne Produce Market', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Victoria' LIMIT 1), 
 'Melbourne, VIC', 'large', 
 '{"cold_storage": true, "distribution": true, "retail_area": true}'),

(uuid_generate_v4(), 'Saskatchewan Grain Pool', 'wholesale', 
 (SELECT id FROM regions WHERE name = 'Saskatchewan' LIMIT 1), 
 'Regina, SK', 'large', 
 '{"grain_elevator": true, "rail_access": true, "export_terminal": true}');

-- Insert Sample Price Records (last 30 days)
-- This will create realistic price data for demonstration
DO $$
DECLARE
    wheat_id UUID;
    rice_id UUID;
    corn_id UUID;
    tomato_id UUID;
    california_id UUID;
    iowa_id UUID;
    punjab_id UUID;
    shandong_id UUID;
    market_id UUID;
    i INTEGER;
    base_price DECIMAL;
    price_variation DECIMAL;
    current_date DATE;
BEGIN
    -- Get product IDs
    SELECT id INTO wheat_id FROM agricultural_products WHERE name = 'Wheat' LIMIT 1;
    SELECT id INTO rice_id FROM agricultural_products WHERE name = 'Rice' LIMIT 1;
    SELECT id INTO corn_id FROM agricultural_products WHERE name = 'Corn (Maize)' LIMIT 1;
    SELECT id INTO tomato_id FROM agricultural_products WHERE name = 'Tomatoes' LIMIT 1;
    
    -- Get region IDs
    SELECT id INTO california_id FROM regions WHERE name = 'California' LIMIT 1;
    SELECT id INTO iowa_id FROM regions WHERE name = 'Iowa' LIMIT 1;
    SELECT id INTO punjab_id FROM regions WHERE name = 'Punjab' LIMIT 1;
    SELECT id INTO shandong_id FROM regions WHERE name = 'Shandong' LIMIT 1;
    
    -- Generate price data for the last 30 days
    FOR i IN 0..29 LOOP
        current_date := CURRENT_DATE - INTERVAL '1 day' * i;
        
        -- Wheat prices (California)
        SELECT id INTO market_id FROM markets WHERE region_id = california_id LIMIT 1;
        base_price := 0.45 + (random() * 0.1 - 0.05); -- $0.40-$0.50 per kg
        INSERT INTO price_records (product_id, market_id, region_id, price_date, price_per_unit, currency, price_type, source, reliability_score, verification_status)
        VALUES (wheat_id, market_id, california_id, current_date, base_price, 'USD', 'wholesale', 'market_operator', 4, 'verified');
        
        -- Wheat prices (Iowa)
        SELECT id INTO market_id FROM markets WHERE region_id = iowa_id LIMIT 1;
        base_price := 0.42 + (random() * 0.08 - 0.04); -- $0.38-$0.46 per kg
        INSERT INTO price_records (product_id, market_id, region_id, price_date, price_per_unit, currency, price_type, source, reliability_score, verification_status)
        VALUES (wheat_id, market_id, iowa_id, current_date, base_price, 'USD', 'wholesale', 'market_operator', 4, 'verified');
        
        -- Rice prices (Punjab)
        SELECT id INTO market_id FROM markets WHERE region_id = punjab_id LIMIT 1;
        base_price := 0.65 + (random() * 0.15 - 0.075); -- $0.575-$0.725 per kg
        INSERT INTO price_records (product_id, market_id, region_id, price_date, price_per_unit, currency, price_type, source, reliability_score, verification_status)
        VALUES (rice_id, market_id, punjab_id, current_date, base_price, 'USD', 'wholesale', 'government', 5, 'verified');
        
        -- Rice prices (Shandong)
        SELECT id INTO market_id FROM markets WHERE region_id = shandong_id LIMIT 1;
        base_price := 0.58 + (random() * 0.12 - 0.06); -- $0.52-$0.64 per kg
        INSERT INTO price_records (product_id, market_id, region_id, price_date, price_per_unit, currency, price_type, source, reliability_score, verification_status)
        VALUES (rice_id, market_id, shandong_id, current_date, base_price, 'USD', 'wholesale', 'market_operator', 4, 'verified');
        
        -- Corn prices (Iowa)
        base_price := 0.28 + (random() * 0.08 - 0.04); -- $0.24-$0.32 per kg
        INSERT INTO price_records (product_id, market_id, region_id, price_date, price_per_unit, currency, price_type, source, reliability_score, verification_status)
        VALUES (corn_id, market_id, iowa_id, current_date, base_price, 'USD', 'wholesale', 'commodity_exchange', 5, 'verified');
        
        -- Tomato prices (California)
        SELECT id INTO market_id FROM markets WHERE region_id = california_id LIMIT 1;
        base_price := 2.50 + (random() * 1.0 - 0.5); -- $2.00-$3.00 per kg
        INSERT INTO price_records (product_id, market_id, region_id, price_date, price_per_unit, currency, price_type, source, reliability_score, verification_status)
        VALUES (tomato_id, market_id, california_id, current_date, base_price, 'USD', 'wholesale', 'market_operator', 4, 'verified');
        
        -- Add some retail prices (20% higher than wholesale)
        INSERT INTO price_records (product_id, market_id, region_id, price_date, price_per_unit, currency, price_type, source, reliability_score, verification_status)
        VALUES (tomato_id, market_id, california_id, current_date, base_price * 1.2, 'USD', 'retail', 'market_survey', 3, 'verified');
        
    END LOOP;
END $$;

-- Insert Data Sources
INSERT INTO data_sources (id, name, source_type, update_frequency, reliability_rating, cost_structure) VALUES
(uuid_generate_v4(), 'USDA Market News', 'government', 'daily', 5, 'free'),
(uuid_generate_v4(), 'Chicago Board of Trade', 'exchange', 'real_time', 5, 'subscription'),
(uuid_generate_v4(), 'FAO Price Monitoring', 'international', 'weekly', 4, 'free'),
(uuid_generate_v4(), 'Reuters Agriculture', 'private', 'real_time', 4, 'subscription'),
(uuid_generate_v4(), 'Bloomberg Commodities', 'private', 'real_time', 5, 'subscription'),
(uuid_generate_v4(), 'Market Operators Network', 'aggregator', 'daily', 3, 'free'),
(uuid_generate_v4(), 'Government Agricultural Departments', 'government', 'weekly', 4, 'free'),
(uuid_generate_v4(), 'Commodity Exchanges Worldwide', 'exchange', 'real_time', 5, 'subscription'); 