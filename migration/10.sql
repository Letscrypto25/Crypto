
CREATE TABLE lottery_pools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pool_type TEXT NOT NULL CHECK(pool_type IN ('weekly', 'monthly')),
  current_amount REAL DEFAULT 0,
  carryover_amount REAL DEFAULT 0,
  last_draw_date DATE,
  next_draw_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
