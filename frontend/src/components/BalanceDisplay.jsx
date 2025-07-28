import React, { useState } from 'react';
import { getBalance } from '../api';

export default function BalanceDisplay() {
  const [gmail, setGmail] = useState('');
  const [balance, setBalance] = useState(null);

  const check = async () => {
    const res = await getBalance(gmail);
    setBalance(res.balance);
  };

  return (
    <div>
      <h2>📊 Check Balance</h2>
      <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="Gmail" />
      <button onClick={check}>Check</button>
      {balance !== null && <p>Balance: {balance}</p>}
    </div>
  );
}
