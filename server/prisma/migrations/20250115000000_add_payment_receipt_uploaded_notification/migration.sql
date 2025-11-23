-- AlterEnum
-- Add PAYMENT_RECEIPT_UPLOADED notification type
-- Note: IF NOT EXISTS is not supported in ALTER TYPE ADD VALUE, so we check if it exists first
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PAYMENT_RECEIPT_UPLOADED' AND enumtypid = 'NotificationType'::regtype) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_RECEIPT_UPLOADED';
    END IF;
END $$;

