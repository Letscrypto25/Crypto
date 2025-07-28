import React, { useState } from 'react';
import { postPayment } from '../api';

export default function PaymentForm() {
  const [gmail, setGmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    const res = await postPayment(gmail, parseFloat(amount));
    setMessage(res.message || 'Error');
  };

  return (
    <div>
      <h2>💸 Submit Payment</h2>
      <input value={gmail} onChange={e => setGmail(e.target.value)} placeholder="Gmail" />
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
      <button onClick={handleSubmit}>Send</button>
      <p>{message}</p>
    </div>
  );
}
