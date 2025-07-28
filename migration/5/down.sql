
-- Remove the inserted subscription tiers
DELETE FROM subscription_tiers WHERE name IN ('basic', 'premium', 'pro');
