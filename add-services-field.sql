-- Add services field to vendors table
ALTER TABLE vendors 
ADD COLUMN services TEXT[] DEFAULT '{}';

-- Add a check constraint to ensure services is an array
ALTER TABLE vendors 
ADD CONSTRAINT services_is_array 
CHECK (services IS NULL OR jsonb_array_length(to_jsonb(services)) >= 0);

-- Comment on the new column
COMMENT ON COLUMN vendors.services IS 'Array of services offered by the vendor'; 