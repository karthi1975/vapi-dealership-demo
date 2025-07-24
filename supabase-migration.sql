-- Migration script for existing Supabase database
-- This script adds missing columns and creates new tables

-- First, let's check what columns exist in the calls table
-- Then add missing columns

-- Add customer_id column to existing calls table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE calls ADD COLUMN customer_id UUID REFERENCES customers(id);
    END IF;
END $$;

-- Add missing columns to existing calls table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'call_duration'
    ) THEN
        ALTER TABLE calls ADD COLUMN call_duration INTEGER;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE calls ADD COLUMN start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE calls ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'status'
    ) THEN
        ALTER TABLE calls ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'outcome'
    ) THEN
        ALTER TABLE calls ADD COLUMN outcome VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'summary'
    ) THEN
        ALTER TABLE calls ADD COLUMN summary TEXT;
    END IF;
END $$;

-- Create new tables that don't exist yet
CREATE TABLE IF NOT EXISTS call_transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    from_agent VARCHAR(50) NOT NULL,
    to_agent VARCHAR(50) NOT NULL,
    reason VARCHAR(100),
    transfer_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    intent_type VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    condition VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_drive_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    customer_id UUID REFERENCES customers(id),
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    preferred_date DATE,
    preferred_time TIME,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financing_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    customer_id UUID REFERENCES customers(id),
    vehicle_price DECIMAL(10,2),
    down_payment DECIMAL(10,2),
    loan_amount DECIMAL(10,2),
    credit_score INTEGER,
    employment_status VARCHAR(50),
    monthly_income DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    approval_decision VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trade_in_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    customer_id UUID REFERENCES customers(id),
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    mileage INTEGER,
    condition VARCHAR(20),
    estimated_value DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    calls_handled INTEGER DEFAULT 0,
    transfers_out INTEGER DEFAULT 0,
    transfers_in INTEGER DEFAULT 0,
    avg_call_duration INTEGER,
    customer_satisfaction DECIMAL(3,2),
    resolution_rate DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_name, date)
);

CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    agent_name VARCHAR(50),
    message_type VARCHAR(20),
    content TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS service_appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    customer_id UUID REFERENCES customers(id),
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    service_type VARCHAR(100),
    preferred_date DATE,
    preferred_time TIME,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    customer_id UUID REFERENCES customers(id),
    part_name VARCHAR(100),
    part_number VARCHAR(50),
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2),
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_follow_ups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    call_id UUID REFERENCES calls(id),
    follow_up_date DATE,
    follow_up_time TIME,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing inventory table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'features'
    ) THEN
        ALTER TABLE inventory ADD COLUMN features JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'images'
    ) THEN
        ALTER TABLE inventory ADD COLUMN images TEXT[];
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE inventory ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_customer_id ON calls(customer_id);
CREATE INDEX IF NOT EXISTS idx_calls_phone_number ON calls(phone_number);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_call_transfers_call_id ON call_transfers(call_id);
CREATE INDEX IF NOT EXISTS idx_customer_intents_call_id ON customer_intents(call_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_interests_call_id ON vehicle_interests(call_id);
CREATE INDEX IF NOT EXISTS idx_test_drive_bookings_customer_id ON test_drive_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_financing_applications_customer_id ON financing_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_in_evaluations_customer_id ON trade_in_evaluations(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_date ON agent_performance(agent_name, date);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_call_id ON conversation_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_inventory_make_model ON inventory(make, model);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_drive_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_follow_ups ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (drop existing policies first to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;

CREATE POLICY "Enable read access for authenticated users" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON customers FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON calls;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON call_transfers;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customer_intents;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON vehicle_interests;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON test_drive_bookings;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON financing_applications;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON trade_in_evaluations;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON agent_performance;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON conversation_logs;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON inventory;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON service_appointments;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON parts_orders;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON promotions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON lead_follow_ups;

CREATE POLICY "Enable all access for authenticated users" ON calls FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON call_transfers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON customer_intents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON vehicle_interests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON test_drive_bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON financing_applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON trade_in_evaluations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON agent_performance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON conversation_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON service_appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON parts_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON promotions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON lead_follow_ups FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data for testing (only if not exists)
INSERT INTO inventory (make, model, year, price, mileage, condition, vin, status) 
SELECT 'Toyota', 'Camry', 2023, 28999.00, 15000, 'used', '1HGBH41JXMN109186', 'available'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE vin = '1HGBH41JXMN109186');

INSERT INTO inventory (make, model, year, price, mileage, condition, vin, status) 
SELECT 'Honda', 'Civic', 2024, 32999.00, 0, 'new', '2T1BURHE0JC123456', 'available'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE vin = '2T1BURHE0JC123456');

INSERT INTO inventory (make, model, year, price, mileage, condition, vin, status) 
SELECT 'Ford', 'F-150', 2023, 45999.00, 25000, 'used', '1FTEW1EG8JFA12345', 'available'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE vin = '1FTEW1EG8JFA12345');

-- Insert sample promotions
INSERT INTO promotions (title, description, discount_percentage, valid_from, valid_until, is_active) 
SELECT 'Summer Sale', 'Get up to 15% off on all used vehicles', 15.00, '2024-06-01', '2024-08-31', true
WHERE NOT EXISTS (SELECT 1 FROM promotions WHERE title = 'Summer Sale');

INSERT INTO promotions (title, description, discount_percentage, valid_from, valid_until, is_active) 
SELECT 'New Car Special', '0% APR financing on all new vehicles', 0.00, '2024-01-01', '2024-12-31', true
WHERE NOT EXISTS (SELECT 1 FROM promotions WHERE title = 'New Car Special');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get call analytics
CREATE OR REPLACE FUNCTION get_call_analytics(start_date DATE, end_date DATE)
RETURNS TABLE (
    total_calls BIGINT,
    avg_duration NUMERIC,
    total_transfers BIGINT,
    most_active_agent VARCHAR(50),
    top_intent VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(c.id) as total_calls,
        AVG(c.call_duration) as avg_duration,
        COUNT(ct.id) as total_transfers,
        (SELECT agent_name FROM agent_performance WHERE date BETWEEN start_date AND end_date ORDER BY calls_handled DESC LIMIT 1) as most_active_agent,
        (SELECT intent_type FROM customer_intents WHERE created_at::date BETWEEN start_date AND end_date GROUP BY intent_type ORDER BY COUNT(*) DESC LIMIT 1) as top_intent
    FROM calls c
    LEFT JOIN call_transfers ct ON c.id = ct.call_id
    WHERE c.created_at::date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get customer journey
CREATE OR REPLACE FUNCTION get_customer_journey(customer_phone VARCHAR)
RETURNS TABLE (
    call_id UUID,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    agents_involved TEXT,
    outcome VARCHAR(50),
    summary TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.start_time,
        c.end_time,
        STRING_AGG(DISTINCT ct.to_agent, ', ') as agents_involved,
        c.outcome,
        c.summary
    FROM calls c
    LEFT JOIN call_transfers ct ON c.id = ct.call_id
    WHERE c.phone_number = customer_phone
    GROUP BY c.id, c.start_time, c.end_time, c.outcome, c.summary
    ORDER BY c.start_time DESC;
END;
$$ LANGUAGE plpgsql; 