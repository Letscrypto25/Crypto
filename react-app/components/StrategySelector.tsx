import { useState, useEffect } from 'react';
import { Target, Check, Zap, TrendingUp, Activity, Coins } from 'lucide-react';
import type { TradingStrategy } from '@/shared/types';
import { useBot, useSubscription } from '@/react-app/hooks/useAPI';

interface StrategySelectorProps {
  strategies: TradingStrategy[];
}

export default function StrategySelector({ strategies }: StrategySelectorProps) {
  const { activateStrategy, botStatus } = useBot();
  const { subscription } = useSubscription();
  const [, setSelectedStrategies] = useState<number[]>([]);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  const canActivate = subscription?.is_active;
  const activeStrategyIds = botStatus.activeStrategies.map((s: any) => s.strategy_id);

  useEffect(() => {
    // Pre-select active strategies
    setSelectedStrategies(activeStrategyIds);
  }, [botStatus.activeStrategies]);

  const getStrategyIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'grid trading':
        return <Activity className="w-5 h-5" />;
      case 'dca bot':
        return <TrendingUp className="w-5 h-5" />;
      case 'momentum trading':
        return <Zap className="w-5 h-5" />;
      case 'arbitrage bot':
        return <Coins className="w-5 h-5" />;
      case 'mean reversion':
        return <Activity className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const handleStrategyToggle = async (strategy: TradingStrategy) => {
    if (!canActivate || isActivating) return;
    
    const isCurrentlyActive = activeStrategyIds.includes(strategy.id);
    
    if (isCurrentlyActive) {
      // Cannot deactivate individual strategies while bot is running
      // User would need to stop the bot first
      return;
    }

    setIsActivating(strategy.id);
    try {
      await activateStrategy(strategy.id);
      // The botStatus will update automatically through the hook
    } finally {
      setIsActivating(null);
    }
  };

  // Remove duplicates from strategies
  const uniqueStrategies = strategies.filter((strategy, index, self) => 
    index === self.findIndex(s => s.id === strategy.id)
  );

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Target className="w-5 h-5 text-purple-400" />
          <span>Select Trading Strategies</span>
        </h2>
        
        {!canActivate && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-orange-300">Subscription Required</span>
          </div>
        )}
      </div>

      {!canActivate ? (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
          <div className="text-orange-300 mb-2">Subscription Required</div>
          <div className="text-xs text-orange-400">
            Choose a subscription tier to access trading strategies.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {uniqueStrategies.map((strategy) => {
            const isActive = activeStrategyIds.includes(strategy.id);
            const isCurrentlyActivating = isActivating === strategy.id;
            
            return (
              <button
                key={strategy.id}
                onClick={() => handleStrategyToggle(strategy)}
                disabled={isCurrentlyActivating || isActive}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-purple-500/20 bg-slate-700/50 hover:border-purple-500/40 hover:bg-slate-700/70'
                } ${isCurrentlyActivating ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {getStrategyIcon(strategy.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{strategy.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isCurrentlyActivating ? (
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ) : isActive ? (
                      <div className="flex items-center space-x-1 text-green-400">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Click to activate</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          
          {uniqueStrategies.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>No strategies available. Please contact support.</p>
            </div>
          )}
          
          {activeStrategyIds.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
              <div className="text-xs text-blue-300">
                <strong>Note:</strong> To change active strategies, stop the bot first, then select new strategies and restart.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
