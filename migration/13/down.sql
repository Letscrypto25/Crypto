
-- Remove subscription tiers
DELETE FROM subscription_tiers WHERE name IN ('basic', 'premium', 'pro');

-- Remove default market preferences  
DELETE FROM user_market_preferences WHERE user_id = 'default';

-- Remove lottery pools
DELETE FROM lottery_pools WHERE pool_type IN ('weekly', 'monthly');
