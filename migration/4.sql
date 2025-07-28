
CREATE TABLE user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'none',
  daily_cost REAL NOT NULL DEFAULT 0,
  last_charged_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  daily_cost REAL NOT NULL,
  features TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_tiers (name, display_name, daily_cost, features, description) VALUES
('basic', 'Basic Auto-Trading', 1.0, '["auto_trading"]', 'Essential automated trading with basic strategies'),
('premium', 'Premium Trading', 2.5, '["auto_trading", "trade_stats", "leaderboard"]', 'Advanced features with detailed statistics and leaderboard access'),
('pro', 'Pro Trading', 5.0, '["auto_trading", "trade_stats", "leaderboard", "multi_coin", "telegram_alerts"]', 'Complete trading suite with multi-coin support and Telegram notifications');
