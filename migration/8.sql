
CREATE TABLE lottery_draws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draw_type TEXT NOT NULL CHECK(draw_type IN ('weekly', 'monthly')),
  draw_date DATE NOT NULL,
  winning_numbers TEXT NOT NULL,
  total_pool REAL DEFAULT 0,
  total_tickets INTEGER DEFAULT 0,
  winners_count INTEGER DEFAULT 0,
  payout_per_winner REAL DEFAULT 0,
  carryover_amount REAL DEFAULT 0,
  profit_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'drawn', 'paid_out')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
