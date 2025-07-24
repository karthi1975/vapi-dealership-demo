-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vapi_call_id VARCHAR(100) UNIQUE,
    customer_id UUID REFERENCES customers(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    call_duration INTEGER,
    transcript TEXT,
    outcome VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_intents table
CREATE TABLE IF NOT EXISTS customer_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id VARCHAR(100),
    intent_type VARCHAR(50),
    confidence DECIMAL(3, 2),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_transfers table
CREATE TABLE IF NOT EXISTS call_transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES calls(id),
    from_agent VARCHAR(50),
    to_agent VARCHAR(50),
    transfer_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicle_interests table
CREATE TABLE IF NOT EXISTS vehicle_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    call_id UUID REFERENCES calls(id),
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    interest_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_drive_bookings table
CREATE TABLE IF NOT EXISTS test_drive_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    vehicle_id VARCHAR(50),
    scheduled_date DATE,
    scheduled_time TIME,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financing_applications table
CREATE TABLE IF NOT EXISTS financing_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    call_id UUID REFERENCES calls(id),
    application_status VARCHAR(20) DEFAULT 'pending',
    credit_score_range VARCHAR(20),
    down_payment DECIMAL(10, 2),
    loan_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_calls_vapi_id ON calls(vapi_call_id);
CREATE INDEX idx_calls_customer_id ON calls(customer_id);
CREATE INDEX idx_intents_call_id ON customer_intents(call_id);
CREATE INDEX idx_transfers_call_id ON call_transfers(call_id);