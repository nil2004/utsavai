-- Add services array column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vendors' AND column_name = 'services') THEN
        ALTER TABLE vendors 
        ADD COLUMN services TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add experience_years column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vendors' AND column_name = 'experience_years') THEN
        ALTER TABLE vendors 
        ADD COLUMN experience_years INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add completed_events column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vendors' AND column_name = 'completed_events') THEN
        ALTER TABLE vendors 
        ADD COLUMN completed_events INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add comments to the new columns
COMMENT ON COLUMN vendors.services IS 'Array of services offered by the vendor';
COMMENT ON COLUMN vendors.experience_years IS 'Number of years of experience';
COMMENT ON COLUMN vendors.completed_events IS 'Number of events completed by the vendor'; 