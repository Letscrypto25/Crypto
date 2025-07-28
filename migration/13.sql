
-- Initialize subscription tiers if they don't exist
INSERT OR IGNORE INTO subscription_tiers (name, display_name, daily_cost, features, description, is_active) VALUES
('basic', 'Basic Plan', 0.4, '["auto_trading", "trade_stats"]', 'Basic automated trading with essential features', 1),
('premium', 'Premium Plan', 1.2, '["auto_trading", "trade_stats", "leaderboard", "multi_coin"]', 'Advanced trading with multiple coins and leaderboard access', 1),
('pro', 'Pro Plan', 2.4, '["auto_trading", "trade_stats", "leaderboard", "multi_coin", "telegram_alerts"]', 'Professional trading with all features including complex bot access', 1);

-- Initialize default market preferences if they don't exist
INSERT OR IGNORE INTO user_market_preferences (user_id, symbol, is_selected, display_order) VALUES
('default', 'BTC', 1, 1),
('default', 'ETH', 1, 2),
('default', 'XRP', 1, 3),
('default', 'LTC', 0, 4),
('default', 'BCH', 0, 5),
('default', 'ADA', 0, 6),
('default', 'DOT', 0, 7),
('default', 'SOL', 0, 8),
('default', 'MATIC', 0, 9),
('default', 'LINK', 0, 10),
('default', 'HBAR', 0, 11);

-- Initialize lottery pools if they don't exist
INSERT OR IGNORE INTO lottery_pools (pool_type, current_amount, carryover_amount, next_draw_date) VALUES
('weekly', 0, 0, date('now', '+7 days')),
('monthly', 0, 0, date('now', '+30 days'));
