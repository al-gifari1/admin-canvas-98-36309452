-- Add product_ids column to checkout_profiles to store assigned products
ALTER TABLE checkout_profiles
ADD COLUMN product_ids UUID[] DEFAULT '{}'::UUID[];