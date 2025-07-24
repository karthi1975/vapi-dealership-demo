-- Alter customers table to add vehicle preference fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS preferred_make VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferred_model VARCHAR(50),
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS purchase_timeline VARCHAR(50);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_make ON customers(preferred_make);
CREATE INDEX IF NOT EXISTS idx_customers_budget ON customers(budget);

-- Example of how to view the updated table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'customers';