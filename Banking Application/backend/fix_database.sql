-- Fix database - Add missing columns
USE banking_system;

-- Add fraud_reasons column
ALTER TABLE hybrid_transactions 
ADD COLUMN fraud_reasons TEXT AFTER status;

-- Add recommendation column
ALTER TABLE hybrid_transactions 
ADD COLUMN recommendation TEXT AFTER fraud_reasons;

-- Verify the changes
DESCRIBE hybrid_transactions;

SELECT 'Columns added successfully!' as status;
