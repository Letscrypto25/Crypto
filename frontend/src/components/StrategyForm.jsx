import React, { useState } from 'react';
import { postStrategy } from '../api';

export default function StrategyForm() {
  const [gmail, setGmail] = useState('');
  const [strategy, setStrategy] = useState('');

  const submit = async () => {
    const res = await postStrategy(gmail, strategy);
    alert(res.message);
  };

  return (
    <div>
      <h2>🧠 Save Strategy</h2>
      <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="Gmail" />
      <textarea value={strategy} onChange={e => setStrategy(e.target.value)} placeholder="Strategy JSON" />
      <button onClick={submit}>Save</button>
    </div>
  );
}
