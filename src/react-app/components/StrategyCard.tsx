import { useState } from 'react';
import { Coins, TrendingUp, Zap, Activity } from 'lucide-react';
import type { TradingStrategy } from '@/shared/types';
import { useBot, useSubscription } from '@/react-app/hooks/useAPI';

interface StrategyCardProps {
  strategy: TradingStrategy;
}

export default function StrategyCard({ strategy }: StrategyCardProps) {
  const { activateStrategy } = useBot();
  const { subscription } = useSubscription();
  const [isActivating, setIsActivating] = useState(false);

  const canActivate = subscription?.is_active;
  
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

  const handleActivate = async () => {
    if (!canActivate || isActivating) return;
    
    setIsActivating(true);
    try {
      await activateStrategy(strategy.id);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/40 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            {getStrategyIcon(strategy.name)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{strategy.name}</h3>
            <div className="text-xs text-purple-400 font-medium mt-1">
              Available with subscription
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {strategy.description}
      </p>

      <button
        onClick={handleActivate}
        disabled={!canActivate || isActivating}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
          canActivate
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
            : 'bg-gray-500/20 text-gray-500 cursor-not-allowed border border-gray-500/20'
        }`}
      >
        {isActivating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Activating...</span>
          </div>
        ) : canActivate ? (
          'Activate Strategy'
        ) : (
          'Subscription Required'
        )}
      </button>
    </div>
  );
}
