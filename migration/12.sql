
-- Initialize lottery pools if they don't exist
INSERT OR IGNORE INTO lottery_pools (pool_type, current_amount, carryover_amount, next_draw_date) 
VALUES 
  ('weekly', 0, 0, date('now', '+7 days')),
  ('monthly', 0, 0, date('now', '+30 days'));

-- Initialize subscription tiers if they don't exist
INSERT OR IGNORE INTO subscription_tiers (name, display_name, daily_cost, features, description) 
VALUES 
  ('basic', 'Basic Plan', 3, 'Access to 3 basic trading strategies, Basic bot features, Standard support', 'Perfect for beginners starting their trading journey'),
  ('pro', 'Pro Plan', 8, 'Access to all trading strategies, Advanced bot features, Custom strategy builder, Priority support, Advanced analytics', 'For serious traders who want maximum control and features'),
  ('premium', 'Premium Plan', 15, 'Everything in Pro, AI-powered strategies, Multi-exchange support, Personal trading coach, 24/7 VIP support', 'The ultimate trading experience for professionals');

-- Initialize default market preferences
INSERT OR IGNORE INTO user_market_preferences (user_id, symbol, is_selected, display_order) 
VALUES 
  ('default', 'BTC', 1, 1),
  ('default', 'ETH', 1, 2),
  ('default', 'XRP', 1, 3),
  ('default', 'LTC', 0, 4),
  ('default', 'BCH', 0, 5),
  ('default', 'ADA', 0, 6),
  ('default', 'DOT', 0, 7),
  ('default', 'SOL', 0, 8),
  ('default', 'MATIC', 0, 9),
  ('default', 'LINK', 0, 10);
