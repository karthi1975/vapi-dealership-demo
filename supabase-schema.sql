-- Car Dealership VAPI Squads Database Schema
-- This schema supports multi-agent voice interactions with full data tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Calls Table
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    phone_number VARCHAR(20) NOT NULL,
    call_duration INTEGER,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    outcome VARCHAR(50),
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Call Transfers Table
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

-- 4. Customer Intents Table
CREATE TABLE IF NOT EXISTS customer_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    intent_type VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Vehicle Interests Table
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

-- 6. Test Drive Bookings Table
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

-- 7. Financing Applications Table
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

-- 8. Trade-in Evaluations Table
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

-- 9. Agent Performance Table
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

-- 10. Conversation Logs Table
CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    agent_name VARCHAR(50),
    message_type VARCHAR(20),
    content TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 11. Inventory Table (for real-time vehicle data)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    mileage INTEGER,
    condition VARCHAR(20) DEFAULT 'used',
    vin VARCHAR(17) UNIQUE,
    status VARCHAR(20) DEFAULT 'available',
    features JSONB,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Service Appointments Table
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

-- 13. Parts Orders Table
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

-- 14. Promotions Table
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

-- 15. Lead Follow-ups Table
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

-- Create RLS (Row Level Security) policies
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

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON customers FOR UPDATE USING (auth.role() = 'authenticated');

-- Repeat for other tables...
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

-- Insert sample data for testing
INSERT INTO inventory (make, model, year, price, mileage, condition, vin, status) VALUES
('Toyota', 'Camry', 2023, 28999.00, 15000, 'used', '1HGBH41JXMN109186', 'available'),
('Honda', 'Civic', 2024, 32999.00, 0, 'new', '2T1BURHE0JC123456', 'available'),
('Ford', 'F-150', 2023, 45999.00, 25000, 'used', '1FTEW1EG8JFA12345', 'available'),
('BMW', 'X5', 2023, 65999.00, 12000, 'used', '5UXCR6C54KLL12345', 'available'),
('Mercedes', 'C-Class', 2024, 54999.00, 5000, 'used', 'WDDWF4HB0FR123456', 'available');

INSERT INTO promotions (title, description, discount_percentage, valid_from, valid_until, is_active) VALUES
('Summer Sale', 'Get up to 15% off on all used vehicles', 15.00, '2024-06-01', '2024-08-31', true),
('New Car Special', '0% APR financing on all new vehicles', 0.00, '2024-01-01', '2024-12-31', true),
('Trade-in Bonus', 'Extra $2000 on your trade-in', 0.00, '2024-05-01', '2024-07-31', true);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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