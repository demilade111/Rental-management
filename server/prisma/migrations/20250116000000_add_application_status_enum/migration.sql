-- AlterEnum
-- Add APPLICATION_STATUS notification type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'APPLICATION_STATUS' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'NotificationType')
    ) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_STATUS';
    END IF;
END $$;

