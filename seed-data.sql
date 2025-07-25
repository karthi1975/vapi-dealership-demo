-- Seed Data for VAPI Dealership Database
-- This file contains sample data for testing the multi-agent system

-- Insert sample inventory
INSERT INTO inventory (vin, make, model, year, type, color, price, mileage, features, status, images, mpg) VALUES
('1HGCM82633A123456', 'Honda', 'Accord', 2024, 'sedan', 'Pearl White', 28500, 15, 
 '{"leather seats", "sunroof", "apple carplay", "lane keeping assist", "adaptive cruise control"}', 
 'available', 
 '{"https://example.com/accord1.jpg", "https://example.com/accord2.jpg"}',
 '{"city": 32, "highway": 42}'::jsonb),

('5XYZU3LB8JG123456', 'Hyundai', 'Santa Fe', 2024, 'suv', 'Calypso Red', 34900, 8,
 '{"awd", "3rd row seating", "panoramic sunroof", "blind spot monitoring", "wireless charging"}',
 'available',
 '{"https://example.com/santafe1.jpg", "https://example.com/santafe2.jpg"}',
 '{"city": 25, "highway": 31}'::jsonb),

('1FTFW1ET5DFC12345', 'Ford', 'F-150', 2023, 'truck', 'Velocity Blue', 45500, 5200,
 '{"4wd", "crew cab", "towing package", "bed liner", "apple carplay", "360 camera"}',
 'available',
 '{"https://example.com/f150_1.jpg", "https://example.com/f150_2.jpg"}',
 '{"city": 20, "highway": 27}'::jsonb),

('JTEBU5JR8K5123456', 'Toyota', '4Runner', 2024, 'suv', 'Army Green', 42800, 120,
 '{"4wd", "crawl control", "leather seats", "jbl audio", "sunroof", "multi-terrain select"}',
 'available',
 '{"https://example.com/4runner1.jpg", "https://example.com/4runner2.jpg"}',
 '{"city": 17, "highway": 21}'::jsonb),

('3MW5R1J07P8C12345', 'BMW', '330i', 2024, 'sedan', 'Alpine White', 43900, 50,
 '{"sport package", "leather seats", "harman kardon audio", "wireless apple carplay", "heated seats"}',
 'available',
 '{"https://example.com/bmw330i_1.jpg"}',
 '{"city": 26, "highway": 36}'::jsonb),

('1G1ZD5ST1PF123456', 'Chevrolet', 'Malibu', 2024, 'sedan', 'Mosaic Black', 24500, 100,
 '{"turbo engine", "wireless charging", "teen driver mode", "wifi hotspot", "apple carplay"}',
 'available',
 '{"https://example.com/malibu1.jpg"}',
 '{"city": 29, "highway": 36}'::jsonb),

('KM8J3CA46RU123456', 'Hyundai', 'Tucson', 2024, 'suv', 'Amazon Gray', 29750, 25,
 '{"awd", "smart cruise control", "highway drive assist", "bose audio", "panoramic sunroof"}',
 'available',
 '{"https://example.com/tucson1.jpg"}',
 '{"city": 26, "highway": 33}'::jsonb),

('1C4HJXEN5PW123456', 'Jeep', 'Grand Cherokee', 2024, 'suv', 'Diamond Black', 38500, 200,
 '{"4wd", "quadra-trac", "alpine audio", "leather seats", "panoramic sunroof", "night vision"}',
 'available',
 '{"https://example.com/grandcherokee1.jpg"}',
 '{"city": 22, "highway": 29}'::jsonb);

-- Insert sample customers
INSERT INTO customers (phone_number, name, email, address, preferred_make, preferred_model, budget, vehicle_type, purchase_timeline) VALUES
('+14085551234', 'John Smith', 'john.smith@email.com', '123 Main St, San Jose, CA 95110', 'Toyota', NULL, 35000, 'suv', '1-2 weeks'),
('+14085555678', 'Sarah Johnson', 'sarah.j@email.com', '456 Oak Ave, Palo Alto, CA 94301', 'Honda', 'Accord', 30000, 'sedan', '1 month'),
('+14085559012', 'Mike Chen', 'mchen@email.com', '789 Pine St, Mountain View, CA 94040', NULL, NULL, 50000, 'truck', 'just browsing'),
('+18016809129', 'Test Customer', 'test@dealership.com', '321 Test St, Salt Lake City, UT 84101', 'Hyundai', 'Santa Fe', 40000, 'suv', 'this week');

-- Insert sample promotions
INSERT INTO promotions (title, description, discount_type, discount_value, valid_from, valid_to, applicable_vehicles) VALUES
('Year End Clearance', 'Special pricing on all 2023 models', 'percentage', 10, NOW(), NOW() + INTERVAL '30 days', '{"type": ["sedan", "suv"]}'),
('First Time Buyer', '0% APR for 60 months for qualified first-time buyers', 'financing', 0, NOW(), NOW() + INTERVAL '60 days', '{}'),
('Military Discount', '$500 off for active military and veterans', 'fixed', 500, NOW(), NOW() + INTERVAL '90 days', '{}'),
('College Grad Rebate', '$400 rebate for recent college graduates', 'fixed', 400, NOW(), NOW() + INTERVAL '180 days', '{}');

-- Insert sample agent performance data
INSERT INTO agent_performance (agent_type, total_interactions, successful_outcomes, average_rating, conversion_rate) VALUES
('leadQualifier', 150, 145, 4.8, 0.85),
('sales', 120, 95, 4.6, 0.42),
('service', 80, 78, 4.9, 0.95),
('finance', 60, 58, 4.7, 0.88),
('parts', 40, 39, 4.8, 0.92);

-- Insert sample test drive bookings (for existing customers)
INSERT INTO test_drive_bookings (customer_id, vehicle_id, scheduled_date, scheduled_time, status, notes)
SELECT 
    c.id as customer_id,
    i.id as vehicle_id,
    CURRENT_DATE + INTERVAL '3 days' as scheduled_date,
    '14:00' as scheduled_time,
    'scheduled' as status,
    'Customer interested in AWD features' as notes
FROM customers c, inventory i
WHERE c.phone_number = '+14085551234' 
AND i.vin = '5XYZU3LB8JG123456'
LIMIT 1;

-- Insert sample calls (for demonstration)
INSERT INTO calls (customer_id, phone_number, call_duration, status, outcome, summary, metadata)
SELECT 
    c.id as customer_id,
    c.phone_number,
    300 as call_duration,
    'completed' as status,
    'qualified' as outcome,
    'Customer interested in SUV under 40k, scheduled test drive for Santa Fe' as summary,
    '{"initial_agent": "leadQualifier", "transferred_to": "sales"}'::jsonb as metadata
FROM customers c
WHERE c.phone_number = '+14085551234'
LIMIT 1;

-- Insert sample vehicle interests
INSERT INTO vehicle_interests (call_id, make, model, year_min, year_max, price_min, price_max, condition, features)
SELECT 
    calls.id as call_id,
    'Hyundai' as make,
    'Santa Fe' as model,
    2023 as year_min,
    2024 as year_max,
    30000 as price_min,
    40000 as price_max,
    'new' as condition,
    '{"awd", "3rd row seating"}'::jsonb as features
FROM calls
WHERE calls.phone_number = '+14085551234'
LIMIT 1;

-- Create a sample lead follow-up
INSERT INTO lead_follow_ups (customer_id, scheduled_date, follow_up_type, priority, notes, assigned_to)
SELECT 
    c.id as customer_id,
    CURRENT_DATE + INTERVAL '7 days' as scheduled_date,
    'phone' as follow_up_type,
    'high' as priority,
    'Follow up on test drive experience and answer financing questions' as notes,
    'sales_team' as assigned_to
FROM customers c
WHERE c.phone_number = '+14085551234'
LIMIT 1;

-- Add sample financing application
INSERT INTO financing_applications (customer_id, requested_amount, down_payment, loan_term, credit_score_range, employment_status, monthly_income, status)
SELECT 
    c.id as customer_id,
    35000 as requested_amount,
    5000 as down_payment,
    60 as loan_term,
    'good' as credit_score_range,
    'employed' as employment_status,
    7500 as monthly_income,
    'pending' as status
FROM customers c
WHERE c.phone_number = '+14085555678'
LIMIT 1;

-- Grant permissions (if needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Display summary
SELECT 'Database seeded successfully!' as message;
SELECT 'Inventory items:' as category, COUNT(*) as count FROM inventory
UNION ALL
SELECT 'Customers:' as category, COUNT(*) as count FROM customers
UNION ALL
SELECT 'Test drives scheduled:' as category, COUNT(*) as count FROM test_drive_bookings
UNION ALL
SELECT 'Active promotions:' as category, COUNT(*) as count FROM promotions;