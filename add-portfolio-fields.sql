-- Add portfolio fields to vendors table
ALTER TABLE vendors 
ADD COLUMN portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN portfolio_description TEXT DEFAULT '',
ADD COLUMN portfolio_events TEXT[] DEFAULT '{}',
ADD COLUMN instagram_reels TEXT[] DEFAULT '{}';

-- Add a check constraint to ensure portfolio_images is an array
ALTER TABLE vendors 
ADD CONSTRAINT portfolio_images_is_array 
CHECK (portfolio_images IS NULL OR jsonb_array_length(to_jsonb(portfolio_images)) >= 0);

-- Add a check constraint to ensure portfolio_events is an array
ALTER TABLE vendors 
ADD CONSTRAINT portfolio_events_is_array 
CHECK (portfolio_events IS NULL OR jsonb_array_length(to_jsonb(portfolio_events)) >= 0);

-- Add a check constraint to ensure instagram_reels is an array
ALTER TABLE vendors 
ADD CONSTRAINT instagram_reels_is_array 
CHECK (instagram_reels IS NULL OR jsonb_array_length(to_jsonb(instagram_reels)) >= 0);

-- Comment on the new columns
COMMENT ON COLUMN vendors.portfolio_images IS 'Array of URLs pointing to portfolio images';
COMMENT ON COLUMN vendors.portfolio_description IS 'Detailed description of vendor portfolio and past work';
COMMENT ON COLUMN vendors.portfolio_events IS 'Array of past event names/descriptions';
COMMENT ON COLUMN vendors.instagram_reels IS 'Array of Instagram Reel URLs'; 