-- Complete Enhanced Schema Setup for VAPI Dealership System
-- Run this in Supabase SQL Editor

-- 1. Update customers table with vehicle preferences
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_year INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS min_mileage INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS max_mileage INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS price_range_min DECIMAL(10,2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS price_range_max DECIMAL(10,2);

-- 2. Create inventory table with full details
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_number VARCHAR(50) UNIQUE NOT NULL,
    year INTEGER NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    trim_level VARCHAR(100),
    mileage INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    condition VARCHAR(20) CHECK (condition IN ('new', 'used', 'certified')),
    color VARCHAR(50),
    vin VARCHAR(17) UNIQUE,
    description TEXT,
    features TEXT[],
    images TEXT[],
    video_url TEXT,
    is_available BOOLEAN DEFAULT true,
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create vehicle_interests table for tracking specific requests
CREATE TABLE IF NOT EXISTS vehicle_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    year INTEGER,
    make VARCHAR(100),
    model VARCHAR(100),
    min_mileage INTEGER,
    max_mileage INTEGER,
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    stock_number VARCHAR(50),
    matched_inventory_ids UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create call_transcripts table
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    transcript JSONB NOT NULL,
    summary TEXT,
    intent_analysis JSONB,
    lead_score INTEGER,
    action_items TEXT[],
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create communication_logs table
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    type VARCHAR(50) CHECK (type IN ('email', 'sms', 'education')),
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(50) CHECK (status IN ('pending', 'sent', 'failed', 'opened', 'clicked')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create shared_links table
CREATE TABLE IF NOT EXISTS shared_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    inventory_ids UUID[],
    short_code VARCHAR(10) UNIQUE NOT NULL,
    full_url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create sales_assignments table
CREATE TABLE IF NOT EXISTS sales_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    salesperson_name VARCHAR(255) NOT NULL,
    salesperson_email VARCHAR(255) NOT NULL,
    salesperson_phone VARCHAR(20),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create education_campaigns table
CREATE TABLE IF NOT EXISTS education_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('buyer_tips', 'financing', 'maintenance')),
    sequence_order INTEGER NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    delay_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory(year, make, model, price, is_available);
CREATE INDEX IF NOT EXISTS idx_vehicle_interests_call ON vehicle_interests(call_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_call ON call_transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_communications_customer ON communication_logs(customer_id, type);
CREATE INDEX IF NOT EXISTS idx_shared_links_code ON shared_links(short_code);

-- Grant permissions (adjust based on your auth setup)
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON vehicle_interests TO authenticated;
GRANT ALL ON call_transcripts TO authenticated;
GRANT ALL ON communication_logs TO authenticated;
GRANT ALL ON shared_links TO authenticated;
GRANT ALL ON sales_assignments TO authenticated;
GRANT ALL ON education_campaigns TO authenticated;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example - adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON inventory FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON inventory FOR UPDATE USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced schema setup completed successfully!';
END $$;