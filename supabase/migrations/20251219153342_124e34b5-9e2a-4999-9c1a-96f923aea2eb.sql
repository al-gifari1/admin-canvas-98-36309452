-- Add profile_type column for physical vs digital products
ALTER TABLE checkout_profiles
ADD COLUMN profile_type TEXT DEFAULT 'physical' CHECK (profile_type IN ('physical', 'digital'));

-- Update payment_methods column to include MFS options
COMMENT ON COLUMN checkout_profiles.payment_methods IS 'Payment methods configuration: cod, online, bkash, nagad, rocket';