-- Update test_drive_bookings table to add missing fields
  -- These fields are used by the sales tools but may be missing from
   the original schema

  -- Add vehicle_info column if it doesn't exist
  ALTER TABLE test_drive_bookings
  ADD COLUMN IF NOT EXISTS vehicle_info VARCHAR(255);

  -- Add customer_name column if it doesn't exist  
  ALTER TABLE test_drive_bookings
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

  -- Add customer_phone column if it doesn't exist
  ALTER TABLE test_drive_bookings
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

  -- Add confirmation_number column if it doesn't exist
  ALTER TABLE test_drive_bookings
  ADD COLUMN IF NOT EXISTS confirmation_number VARCHAR(50);

  -- Update the notes column to TEXT type for longer notes
  ALTER TABLE test_drive_bookings
  ALTER COLUMN notes TYPE TEXT;

  -- Add indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_test_drive_phone ON
  test_drive_bookings(customer_phone);
  CREATE INDEX IF NOT EXISTS idx_test_drive_confirmation ON
  test_drive_bookings(confirmation_number);

  -- Update call_contexts table to ensure proper call_id handling
  -- The call_id should be VARCHAR to handle VAPI's string IDs
  ALTER TABLE call_contexts DROP CONSTRAINT IF EXISTS
  call_contexts_pkey;
  ALTER TABLE call_contexts
  ALTER COLUMN call_id TYPE VARCHAR(255);
  ALTER TABLE call_contexts ADD PRIMARY KEY (call_id);

  -- For call_transfers, we need to handle the foreign key properly
  -- Since calls.id is UUID but VAPI sends string IDs, we'll remove 
  the FK constraint
  ALTER TABLE call_transfers DROP CONSTRAINT IF EXISTS
  call_transfers_call_id_fkey;

  -- Add a new column for VAPI call ID (string) while keeping the 
  original call_id as UUID
  ALTER TABLE call_transfers
  ADD COLUMN IF NOT EXISTS vapi_call_id VARCHAR(255);

  -- Add index for performance
  CREATE INDEX IF NOT EXISTS idx_call_transfers_vapi_call_id ON
  call_transfers(vapi_call_id);

  -- Grant permissions to authenticated users
  GRANT ALL ON test_drive_bookings TO authenticated;
  GRANT ALL ON call_contexts TO authenticated;
  GRANT ALL ON call_transfers TO authenticated;

  -- Display confirmation
  SELECT 'Tables updated successfully!' as message;