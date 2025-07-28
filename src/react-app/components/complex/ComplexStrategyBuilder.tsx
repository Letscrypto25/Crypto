import { useState } from 'react';
import { Brain, Settings, TrendingUp, Save, Play, Target, Activity, Zap } from 'lucide-react';
import type { TradingStrategy } from '@/shared/types';
import { useBot, useSubscription } from '@/react-app/hooks/useAPI';

interface ComplexStrategyBuilderProps {
  strategies: TradingStrategy[];
}

export default function ComplexStrategyBuilder({ strategies }: ComplexStrategyBuilderProps) {
  const { activateStrategy } = useBot();
  const { subscription } = useSubscription();
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [customConfig, setCustomConfig] = useState({
    indicators: ['RSI', 'MACD'],
    timeframe: '1h',
    entryConditions: ['RSI oversold', 'MACD bullish crossover'],
    exitConditions: ['RSI overbought', 'Stop loss hit'],
    riskManagement: {
      stopLoss: 3,
      takeProfit: 8,
      maxRisk: 2,
      maxConcurrentTrades: 3,
      trailingStop: false
    },
    advanced: {
      martingale: false,
      dynamicSizing: true,
      newsFilter: false,
      volatilityFilter: true
    }
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'preview'>('basic');

  const canUseBuilder = subscription?.subscription_tier === 'pro' && subscription?.is_active;

  const handleBuildStrategy = async () => {
    if (!selectedStrategy || !canUseBuilder) return;
    
    setIsBuilding(true);
    try {
      await activateStrategy(selectedStrategy, customConfig);
    } finally {
      setIsBuilding(false);
    }
  };

  const availableIndicators = [
    'RSI', 'MACD', 'Bollinger Bands', 'EMA', 'SMA', 'Stochastic', 
    'Williams %R', 'CCI', 'ADX', 'Ichimoku', 'Fibonacci', 'Volume Profile'
  ];

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

  const entryConditions = [
    'RSI oversold', 'RSI overbought', 'MACD bullish crossover', 'MACD bearish crossover',
    'Price above EMA', 'Price below EMA', 'Bollinger Band breakout', 'Volume spike',
    'Support level bounce', 'Resistance level break', 'Fibonacci retracement'
  ];

  const exitConditions = [
    'RSI overbought', 'RSI oversold', 'MACD reversal', 'Take profit hit',
    'Stop loss hit', 'Trailing stop', 'Time-based exit', 'Volume decline'
  ];

  // Enhanced strategies for complex bot
  const complexStrategies = [
    ...strategies,
    {
      id: 999,
      name: 'AI Neural Network',
      description: 'Advanced machine learning strategy using neural networks for pattern recognition',
      lc_cost: 5,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: 998,
      name: 'Multi-Timeframe Analysis',
      description: 'Analyzes multiple timeframes simultaneously for better entry/exit timing',
      lc_cost: 3.5,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: 997,
      name: 'Options Flow Strategy',
      description: 'Follows institutional options flow for directional bias',
      lc_cost: 4.5,
      is_active: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: 996,
      name: 'Sentiment Analysis Bot',
      description: 'Uses social media and news sentiment to predict price movements',
      lc_cost: 4,
      is_active: true,
      created_at: '',
      updated_at: ''
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-400" />
          <span>Advanced Strategy Builder</span>
        </h2>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1">
          <span className="text-xs font-medium text-blue-300">Pro Feature</span>
        </div>
      </div>

      {!canUseBuilder ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
          <div className="text-yellow-300 mb-2">Pro Subscription Required</div>
          <div className="text-xs text-yellow-400">
            Upgrade to Pro to access the Advanced Strategy Builder with full customization options.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Base Strategy Selection */}
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-3">Select Base Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {complexStrategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedStrategy === strategy.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-blue-500/20 bg-slate-700/50 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {strategy.id >= 996 ? (
                      <Activity className="w-4 h-4 text-blue-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-sm font-medium text-white">{strategy.name}</span>
                    {strategy.id >= 996 && (
                      <span className="bg-green-500/20 text-green-300 px-1 py-0.5 rounded text-xs">NEW</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{strategy.description}</p>
                  {strategy.id >= 996 && (
                    <div className="text-xs text-blue-400 mt-1 font-medium">
                      Cost: {strategy.lc_cost} LC • Pro Only
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedStrategy && (
            <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-slate-800/30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'basic'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Basic Config
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'advanced'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Advanced
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Basic Configuration */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <span>Basic Configuration</span>
                  </h3>

                  {/* Indicators Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Technical Indicators
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableIndicators.map((indicator) => (
                        <button
                          key={indicator}
                          onClick={() => {
                            const isSelected = customConfig.indicators.includes(indicator);
                            setCustomConfig({
                              ...customConfig,
                              indicators: isSelected
                                ? customConfig.indicators.filter(i => i !== indicator)
                                : [...customConfig.indicators, indicator]
                            });
                          }}
                          className={`p-2 rounded text-xs font-medium transition-all duration-200 ${
                            customConfig.indicators.includes(indicator)
                              ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                              : 'bg-slate-700/50 text-gray-400 border border-gray-600/50 hover:border-blue-500/30'
                          }`}
                        >
                          {indicator}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeframe Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Timeframe
                    </label>
                    <div className="flex space-x-2">
                      {timeframes.map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setCustomConfig({ ...customConfig, timeframe: tf })}
                          className={`px-3 py-2 rounded text-xs font-medium transition-all duration-200 ${
                            customConfig.timeframe === tf
                              ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                              : 'bg-slate-700/50 text-gray-400 border border-gray-600/50 hover:border-blue-500/30'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entry/Exit Conditions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Entry Conditions
                      </label>
                      <div className="space-y-1">
                        {entryConditions.map((condition) => (
                          <button
                            key={condition}
                            onClick={() => {
                              const isSelected = customConfig.entryConditions.includes(condition);
                              setCustomConfig({
                                ...customConfig,
                                entryConditions: isSelected
                                  ? customConfig.entryConditions.filter(c => c !== condition)
                                  : [...customConfig.entryConditions, condition]
                              });
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs transition-all duration-200 ${
                              customConfig.entryConditions.includes(condition)
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-slate-700/30 text-gray-400 hover:bg-slate-600/30'
                            }`}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Exit Conditions
                      </label>
                      <div className="space-y-1">
                        {exitConditions.map((condition) => (
                          <button
                            key={condition}
                            onClick={() => {
                              const isSelected = customConfig.exitConditions.includes(condition);
                              setCustomConfig({
                                ...customConfig,
                                exitConditions: isSelected
                                  ? customConfig.exitConditions.filter(c => c !== condition)
                                  : [...customConfig.exitConditions, condition]
                              });
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs transition-all duration-200 ${
                              customConfig.exitConditions.includes(condition)
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-slate-700/30 text-gray-400 hover:bg-slate-600/30'
                            }`}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Configuration */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <span>Advanced Settings</span>
                  </h3>

                  {/* Risk Management */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stop Loss (%)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={customConfig.riskManagement.stopLoss}
                        onChange={(e) => setCustomConfig({
                          ...customConfig,
                          riskManagement: {
                            ...customConfig.riskManagement,
                            stopLoss: parseFloat(e.target.value) || 3
                          }
                        })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Take Profit (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        step="1"
                        value={customConfig.riskManagement.takeProfit}
                        onChange={(e) => setCustomConfig({
                          ...customConfig,
                          riskManagement: {
                            ...customConfig.riskManagement,
                            takeProfit: parseFloat(e.target.value) || 8
                          }
                        })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Risk per Trade (%)
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={customConfig.riskManagement.maxRisk}
                        onChange={(e) => setCustomConfig({
                          ...customConfig,
                          riskManagement: {
                            ...customConfig.riskManagement,
                            maxRisk: parseFloat(e.target.value) || 2
                          }
                        })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Concurrent Trades
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        value={customConfig.riskManagement.maxConcurrentTrades}
                        onChange={(e) => setCustomConfig({
                          ...customConfig,
                          riskManagement: {
                            ...customConfig.riskManagement,
                            maxConcurrentTrades: parseInt(e.target.value) || 3
                          }
                        })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* Advanced Features */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-300">Trailing Stop</div>
                        <div className="text-xs text-gray-500">Adjust stop loss as profit increases</div>
                      </div>
                      <button
                        onClick={() => setCustomConfig({
                          ...customConfig,
                          riskManagement: {
                            ...customConfig.riskManagement,
                            trailingStop: !customConfig.riskManagement.trailingStop
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          customConfig.riskManagement.trailingStop ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            customConfig.riskManagement.trailingStop ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-300">Dynamic Position Sizing</div>
                        <div className="text-xs text-gray-500">Adjust trade size based on volatility</div>
                      </div>
                      <button
                        onClick={() => setCustomConfig({
                          ...customConfig,
                          advanced: {
                            ...customConfig.advanced,
                            dynamicSizing: !customConfig.advanced.dynamicSizing
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          customConfig.advanced.dynamicSizing ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            customConfig.advanced.dynamicSizing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-300">Volatility Filter</div>
                        <div className="text-xs text-gray-500">Avoid trading in high volatility periods</div>
                      </div>
                      <button
                        onClick={() => setCustomConfig({
                          ...customConfig,
                          advanced: {
                            ...customConfig.advanced,
                            volatilityFilter: !customConfig.advanced.volatilityFilter
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          customConfig.advanced.volatilityFilter ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            customConfig.advanced.volatilityFilter ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-300">News Filter</div>
                        <div className="text-xs text-gray-500">Pause trading during major news events</div>
                      </div>
                      <button
                        onClick={() => setCustomConfig({
                          ...customConfig,
                          advanced: {
                            ...customConfig.advanced,
                            newsFilter: !customConfig.advanced.newsFilter
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          customConfig.advanced.newsFilter ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            customConfig.advanced.newsFilter ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Strategy Preview</span>
                  </h3>

                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-blue-300">Selected Strategy</div>
                      <div className="text-white">
                        {complexStrategies.find(s => s.id === selectedStrategy)?.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-blue-300">Indicators ({customConfig.indicators.length})</div>
                      <div className="text-white text-sm">
                        {customConfig.indicators.join(', ')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-blue-300">Timeframe</div>
                      <div className="text-white">{customConfig.timeframe}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-blue-300">Risk Management</div>
                        <div className="text-white text-sm space-y-1">
                          <div>Stop Loss: {customConfig.riskManagement.stopLoss}%</div>
                          <div>Take Profit: {customConfig.riskManagement.takeProfit}%</div>
                          <div>Max Risk: {customConfig.riskManagement.maxRisk}%</div>
                          <div>Max Trades: {customConfig.riskManagement.maxConcurrentTrades}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-blue-300">Advanced Features</div>
                        <div className="text-white text-sm space-y-1">
                          <div>Trailing Stop: {customConfig.riskManagement.trailingStop ? '✓' : '✗'}</div>
                          <div>Dynamic Sizing: {customConfig.advanced.dynamicSizing ? '✓' : '✗'}</div>
                          <div>Volatility Filter: {customConfig.advanced.volatilityFilter ? '✓' : '✗'}</div>
                          <div>News Filter: {customConfig.advanced.newsFilter ? '✓' : '✗'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleBuildStrategy}
                  disabled={isBuilding}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isBuilding ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{isBuilding ? 'Deploying...' : 'Deploy Strategy'}</span>
                </button>

                <button className="bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
