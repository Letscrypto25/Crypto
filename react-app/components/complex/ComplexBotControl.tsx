import { useState, useEffect } from 'react';
import { Play, Pause, Settings, AlertCircle, Sliders, Target, Activity, Wallet } from 'lucide-react';
import { useBot, useProfile, useSubscription } from '@/react-app/hooks/useAPI';

export default function ComplexBotControl() {
  const { botStatus, toggleBot, loading } = useBot();
  const { profile, fetchProfile } = useProfile();
  const { subscription } = useSubscription();
  const [isToggling, setIsToggling] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      console.log('ComplexBotControl: Balance update event received with data:', event.detail);
      // Force immediate re-fetch of profile data
      fetchProfile();
    };
    
    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, [fetchProfile]);

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
  const hasProSubscription = subscription?.subscription_tier === 'pro' && subscription?.is_active;
  const minTradeAmount = 100; // R100 minimum per trade
  const hasMinBalance = profile && (profile.luno_balance_zar || 0) >= minTradeAmount;
  
  const canActivate = hasCredentials && hasProSubscription && hasMinBalance;
  
  const getActivationErrors = () => {
    const errors = [];
    if (!hasProSubscription) {
      errors.push('Pro subscription required for Complex Bot access. Please upgrade your subscription.');
    }
    if (!hasCredentials) {
      errors.push('Luna API credentials required to activate the trading bot. Configure them in the settings below.');
    }
    if (!hasMinBalance) {
      if (!profile?.luno_balance_zar || profile.luno_balance_zar === 0) {
        errors.push('No Luno balance available for trading. Please fund your Luno account to start trading.');
      } else {
        errors.push(`Insufficient Luno balance. Minimum R${minTradeAmount} required for trading (current: R${(profile?.luno_balance_zar || 0).toFixed(2)}).`);
      }
    }
    return errors;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Advanced Bot Control</span>
        </h2>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            botStatus.botActive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {botStatus.botActive ? 'Active' : 'Inactive'}
          </div>
          
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
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

        {/* Balance Display */}
        {profile && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-300 flex items-center space-x-1">
                <Wallet className="w-3 h-3" />
                <span>Available Balance</span>
              </span>
              <span className="text-xs text-blue-400">Min: R{minTradeAmount}</span>
            </div>
            <div className="text-lg font-bold text-white">
              R{(profile.luno_balance_zar || 0).toFixed(2)}
            </div>
            <div className={`text-xs mt-1 ${hasMinBalance ? 'text-green-400' : 'text-red-400'}`}>
              {hasMinBalance ? '✓ Sufficient for trading' : `⚠ Below minimum (R${minTradeAmount})`}
            </div>
          </div>
        )}

        {/* Advanced Settings Panel */}
        {showAdvancedSettings && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-6">
            <h3 className="text-sm font-medium text-blue-300 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Advanced Risk Management</span>
            </h3>
            
            {/* Basic Risk Controls */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-300 border-b border-gray-600/30 pb-1">Basic Controls</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Max Risk per Trade (%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    defaultValue="2"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1%</span>
                    <span>2.0%</span>
                    <span>5.0%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Stop Loss (%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    defaultValue="3"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1%</span>
                    <span>3%</span>
                    <span>10%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Take Profit (%)
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    defaultValue="8"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2%</span>
                    <span>8%</span>
                    <span>20%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Max Concurrent Trades
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    defaultValue="3"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>3</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Protection */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-300 border-b border-gray-600/30 pb-1">Portfolio Protection</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Maximum Daily Loss (%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    defaultValue="5"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1%</span>
                    <span>5%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Maximum Weekly Loss (%)
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="1"
                    defaultValue="10"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2%</span>
                    <span>10%</span>
                    <span>25%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Maximum Drawdown (%)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    defaultValue="15"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5%</span>
                    <span>15%</span>
                    <span>30%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Risk-Reward Ratio
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    defaultValue="2.5"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1:1</span>
                    <span>2.5:1</span>
                    <span>5:1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Position Sizing */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-300 border-b border-gray-600/30 pb-1">Position Sizing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Position Sizing Method
                  </label>
                  <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Portfolio Percentage</option>
                    <option value="kelly">Kelly Criterion</option>
                    <option value="volatility">Volatility-Based</option>
                    <option value="atr">ATR-Based</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Max Position Size (% of portfolio)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    defaultValue="20"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5%</span>
                    <span>20%</span>
                    <span>50%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Correlation Limit (%)
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="5"
                    defaultValue="70"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30%</span>
                    <span>70%</span>
                    <span>90%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Volatility Adjustment Factor
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    defaultValue="1"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Conditions */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-300 border-b border-gray-600/30 pb-1">Market Condition Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Market Regime Filter
                  </label>
                  <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="all">All Markets</option>
                    <option value="trending">Trending Only</option>
                    <option value="ranging">Ranging Only</option>
                    <option value="volatile">High Volatility</option>
                    <option value="calm">Low Volatility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Minimum Volume Threshold
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="25"
                    defaultValue="100"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50M</span>
                    <span>100M</span>
                    <span>500M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Trading Hours
                  </label>
                  <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="24h">24/7 Trading</option>
                    <option value="business">Business Hours Only</option>
                    <option value="active">Active Hours (8AM-8PM)</option>
                    <option value="custom">Custom Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    News Impact Filter (hours)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="1"
                    defaultValue="2"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0h</span>
                    <span>2h</span>
                    <span>24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Controls */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-300 border-b border-gray-600/30 pb-1">Emergency Controls</h4>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs py-2 px-3 rounded-lg transition-all duration-200">
                  Emergency Stop All
                </button>
                <button className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs py-2 px-3 rounded-lg transition-all duration-200">
                  Close All Positions
                </button>
                <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs py-2 px-3 rounded-lg transition-all duration-200">
                  Reduce Risk Mode
                </button>
                <button className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs py-2 px-3 rounded-lg transition-all duration-200">
                  Reset to Default
                </button>
              </div>
              
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-3">
                <div className="text-xs text-orange-300 mb-2 font-medium">Risk Status Monitor</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Current Daily Loss:</span>
                    <span className="text-green-400">-1.2%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Current Weekly Loss:</span>
                    <span className="text-green-400">-3.8%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Portfolio Drawdown:</span>
                    <span className="text-yellow-400">-8.5%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Risk Level:</span>
                    <span className="text-green-400">Moderate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleToggle}
          disabled={loading || isToggling || (!canActivate && !botStatus.botActive)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            botStatus.botActive
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              : canActivate
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25'
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
              ? 'Stop Complex Bot' 
              : 'Start Complex Bot'
            }
          </span>
        </button>

        {botStatus.activeStrategies.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Active Custom Strategies</span>
            </h3>
            <div className="space-y-2">
              {botStatus.activeStrategies.map((strategy: any) => (
                <div key={strategy.id} className="flex items-center justify-between text-xs text-gray-300 bg-slate-700/50 rounded px-2 py-1">
                  <span>{strategy.strategy_name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Running</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
