
CREATE TABLE lottery_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  draw_id INTEGER,
  draw_type TEXT NOT NULL CHECK(draw_type IN ('weekly', 'monthly')),
  numbers TEXT NOT NULL,
  cost REAL NOT NULL,
  matches INTEGER DEFAULT 0,
  payout REAL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'win', 'partial_win', 'lose', 'refund')),
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
