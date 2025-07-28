
INSERT INTO lottery_pools (pool_type, current_amount, carryover_amount, next_draw_date) VALUES 
('weekly', 0, 0, date('now', '+7 days')),
('monthly', 0, 0, date('now', '+30 days'));
