import React from 'react';
import ReactDOM from 'react-dom/client';
import BalanceDisplay from './components/BalanceDisplay';
import PaymentForm from './components/PaymentForm';
import StrategyForm from './components/StrategyForm';
import DrawResult from './components/DrawResult';

ReactDOM.createRoot(document.getElementById('root')).render(
  <div className="p-6 space-y-6">
    <PaymentForm />
    <BalanceDisplay />
    <StrategyForm />
    <DrawResult />
  </div>
);
