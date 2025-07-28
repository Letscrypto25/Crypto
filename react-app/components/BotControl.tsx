import { useState, useEffect } from 'react';
import { Play, Pause, Settings, TrendingUp, AlertCircle, Wallet, RefreshCw } from 'lucide-react';
import { useBot, useProfile, useSubscription } from '@/react-app/hooks/useAPI';

export default function BotControl() {
  const { botStatus, toggleBot, loading } = useBot();
  const { profile } = useProfile();
  const { subscription } = useSubscription();
  const [isToggling, setIsToggling] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState({
    btc: 0,
    eth: 0,
    hbar: 0,
    lastUpdated: null as Date | null
  });
  const [priceLoading, setPriceLoading] = useState(true);
  
  // Fetch live crypto prices
  const fetchCryptoPrices = async () => {
    try {
      setPriceLoading(true);
      const response = await fetch('/api/crypto-prices');
      if (response.ok) {
        const data = await response.json();
        setCryptoPrices({
          btc: data.btc || 0,
          eth: data.eth || 0,
          hbar: data.hbar || 0,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  // Set up interval to fetch prices every 5 minutes
  useEffect(() => {
    fetchCryptoPrices(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchCryptoPrices();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Calculate total portfolio value in ZAR using live prices
  const getTotalPortfolioValue = () => {
    if (!profile || !cryptoPrices) return 0;
    
    const zar = profile.luno_balance_zar || 0;
    const btc = profile.luno_balance_btc || 0;
    const eth = profile.luno_balance_eth || 0;
    const hbar = profile.luno_balance_hbar || 0;
    
    return (
      zar + 
      (btc * cryptoPrices.btc) + 
      (eth * cryptoPrices.eth) + 
      (hbar * cryptoPrices.hbar)
    );
  };

  const handleToggle = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      await toggleBot(!botStatus.botActive);
    } finally {
      setIsToggling(false);
    }
  };

  const hasCredentials = profile && profile.luna_api_key && profile.luna_api_secret;
  const hasActiveSubscription = subscription?.is_active;
  const minTradeAmount = 100; // R100 minimum per trade
  const totalPortfolioValue = getTotalPortfolioValue();
  const hasMinBalance = totalPortfolioValue >= minTradeAmount;
  
  const canActivate = hasCredentials && hasActiveSubscription && hasMinBalance;
  
  const getActivationErrors = () => {
    const errors = [];
    if (!hasCredentials) {
      errors.push('Luno API credentials required to activate the trading bot. Configure them in the settings below.');
    }
    if (!hasActiveSubscription) {
      errors.push('You need an active subscription to use the trading bot. Choose a subscription tier above.');
    }
    if (!hasMinBalance) {
      if (totalPortfolioValue === 0) {
        errors.push('No crypto assets available for trading. Please fund your Luno account to start trading.');
      } else {
        errors.push(`Insufficient portfolio value. Minimum R${minTradeAmount} required for trading (current: R${totalPortfolioValue.toFixed(2)}).`);
      }
    }
    return errors;
  };

  // Format currency with proper symbols
  const formatCurrency = (value: number) => {
    return `R ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-purple-400" />
          <span>Bot Control</span>
        </h2>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          botStatus.botActive 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {botStatus.botActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="space-y-4">
        {!canActivate && !botStatus.botActive && (
          <div className="space-y-3">
            {getActivationErrors().map((error, index) => (
              <div key={index} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-300">{error}</div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Value Display */}
        <div className="bg-slate-700/30 border border-gray-600/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-300 flex items-center space-x-1">
              <Wallet className="w-3 h-3" />
              <span>Total Portfolio Value (ZAR)</span>
            </span>
            <button 
              onClick={fetchCryptoPrices}
              disabled={priceLoading}
              className="text-xs text-gray-400 hover:text-gray-300 flex items-center"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${priceLoading ? 'animate-spin' : ''}`} />
              Refresh Prices
            </button>
          </div>
          <div className="text-lg font-bold text-white">
            {formatCurrency(totalPortfolioValue)}
          </div>
          <div className={`text-xs mt-1 ${hasMinBalance ? 'text-green-400' : 'text-red-400'}`}>
            {hasMinBalance ? '✓ Sufficient for trading' : `⚠ Below minimum (R${minTradeAmount})`}
          </div>
          {cryptoPrices.lastUpdated && (
            <div className="text-xs text-gray-500 mt-1">
              Prices updated: {cryptoPrices.lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Asset Breakdown */}
        <div className="bg-slate-700/30 border border-gray-600/30 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-300 mb-2">Asset Breakdown</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ZAR Balance:</span>
              <span>{formatCurrency(profile?.luno_balance_zar || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>BTC Balance:</span>
              <span>{(profile?.luno_balance_btc || 0).toFixed(8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>BTC Value:</span>
              <span>{formatCurrency((profile?.luno_balance_btc || 0) * cryptoPrices.btc)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ETH Balance:</span>
              <span>{(profile?.luno_balance_eth || 0).toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ETH Value:</span>
              <span>{formatCurrency((profile?.luno_balance_eth || 0) * cryptoPrices.eth)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>HBAR Balance:</span>
              <span>{(profile?.luno_balance_hbar || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>HBAR Value:</span>
              <span>{formatCurrency((profile?.luno_balance_hbar || 0) * cryptoPrices.hbar)}</span>
            </div>
          </div>
        </div>

        {/* Current Prices */}
        <div className="bg-slate-700/30 border border-gray-600/30 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-300 mb-2">Current Prices</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-slate-800/50 rounded p-2">
              <div className="text-gray-400">BTC/ZAR</div>
              <div>{formatCurrency(cryptoPrices.btc)}</div>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <div className="text-gray-400">ETH/ZAR</div>
              <div>{formatCurrency(cryptoPrices.eth)}</div>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <div className="text-gray-400">HBAR/ZAR</div>
              <div>{formatCurrency(cryptoPrices.hbar)}</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading || isToggling || (!canActivate && !botStatus.botActive)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            botStatus.botActive
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              : canActivate
              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
              : 'bg-gray-500/10 text-gray-500 border border-gray-500/20 cursor-not-allowed'
          }`}
        >
          {isToggling ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : botStatus.botActive ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>
            {isToggling 
              ? 'Processing...' 
              : botStatus.botActive 
              ? 'Stop Bot' 
              : 'Start Bot'
            }
          </span>
        </button>

        {botStatus.activeStrategies.length > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-300 mb-2 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Active Strategies</span>
            </h3>
            <div className="space-y-2">
              {botStatus.activeStrategies.map((strategy: any) => (
                <div key={strategy.id} className="text-xs text-gray-300 bg-slate-700/50 rounded px-2 py-1">
                  {strategy.strategy_name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}