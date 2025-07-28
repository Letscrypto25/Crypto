
CREATE TABLE user_market_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, symbol)
);

INSERT INTO user_market_preferences (user_id, symbol, is_selected, display_order) VALUES
('default', 'BTC', 1, 1),
('default', 'ETH', 1, 2),
('default', 'XRP', 1, 3),
('default', 'LTC', 1, 4),
('default', 'BCH', 1, 5),
('default', 'ADA', 0, 6),
('default', 'DOT', 0, 7),
('default', 'SOL', 0, 8),
('default', 'MATIC', 0, 9),
('default', 'LINK', 0, 10);
