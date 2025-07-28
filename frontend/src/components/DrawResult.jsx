import React, { useState } from 'react';
import { getDrawResult } from '../api';

export default function DrawResult() {
  const [winner, setWinner] = useState('');

  const draw = async () => {
    const res = await getDrawResult();
    setWinner(res.winner);
  };

  return (
    <div>
      <h2>🎯 Weekly Draw</h2>
      <button onClick={draw}>Draw</button>
      {winner && <p>Winner: {winner}</p>}
    </div>
  );
}
