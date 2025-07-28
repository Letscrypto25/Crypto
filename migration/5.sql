
-- Insert subscription tiers if they don't exist
INSERT OR IGNORE INTO subscription_tiers (name, display_name, daily_cost, features, description) VALUES
('basic', 'Basic', 1, '["auto_trading", "trade_stats"]', 'Essential trading features for beginners'),
('premium', 'Premium', 3, '["auto_trading", "trade_stats", "leaderboard", "multi_coin"]', 'Advanced trading with multi-coin support'),
('pro', 'Pro', 5, '["auto_trading", "trade_stats", "leaderboard", "multi_coin", "telegram_alerts"]', 'Full access to Complex Bot and all premium features');
