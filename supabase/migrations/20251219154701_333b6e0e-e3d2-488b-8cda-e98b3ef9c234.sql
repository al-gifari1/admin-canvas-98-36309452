-- Add email_enabled column to checkout_profiles
ALTER TABLE checkout_profiles
ADD COLUMN email_enabled BOOLEAN DEFAULT false;