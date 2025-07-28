
ALTER TABLE user_profiles ADD COLUMN luno_balance_zar REAL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN luno_balance_btc REAL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN luno_balance_eth REAL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN luno_last_sync DATETIME;
