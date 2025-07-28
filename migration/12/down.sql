
-- Remove default data (keep user data)
DELETE FROM lottery_pools WHERE pool_type IN ('weekly', 'monthly');
DELETE FROM subscription_tiers WHERE name IN ('basic', 'pro', 'premium');
DELETE FROM user_market_preferences WHERE user_id = 'default';
