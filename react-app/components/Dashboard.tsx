import { useStrategies, useSubscription, useTradingPerformance } from '@/react-app/hooks/useAPI';
import Header from '@/react-app/components/Header';
import BotControl from '@/react-app/components/BotControl';
import CoinPurchase from '@/react-app/components/CoinPurchase';
import LunaApiSettings from '@/react-app/components/LunaApiSettings';
import LunoBalance from '@/react-app/components/LunoBalance';
import BalanceSyncButton from '@/react-app/components/BalanceSyncButton';
import SubscriptionTiers from '@/react-app/components/SubscriptionTiers';
import MarketSelector from '@/react-app/components/MarketSelector';
import MarketOverview from '@/react-app/components/MarketOverview';
import Leaderboard from '@/react-app/components/Leaderboard';
import LotterySystem from '@/react-app/components/LotterySystem';
import LotteryAdmin from '@/react-app/components/LotteryAdmin';
import StrategySelector from '@/react-app/components/StrategySelector';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { strategies, loading } = useStrategies();
  const { tiers, loading: tiersLoading } = useSubscription();
  const { performance, loading: performanceLoading } = useTradingPerformance();

  if (loading || tiersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin">
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bot Control & Purchase */}
          <div className="space-y-6">
            <BotControl />
            <LunaApiSettings />
            <LunoBalance />
            <div className="bg-slate-800/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-orange-300 mb-3 flex items-center justify-between">
                <span>Quick Actions</span>
                <BalanceSyncButton compact={true} />
              </h3>
              <BalanceSyncButton />
            </div>
            
            <MarketSelector />
            <LotteryAdmin />
            <CoinPurchase />
          </div>

          {/* Right Column - Subscription & Strategies */}
          <div className="lg:col-span-2 space-y-8">
            {/* Market Overview */}
            <MarketOverview />

            {/* Weekly Leaderboard */}
            <Leaderboard />

            {/* Lottery System */}
            <LotterySystem />

            {/* Subscription Tiers */}
            <SubscriptionTiers tiers={tiers} />

            {/* Trading Strategies */}
            <StrategySelector strategies={strategies} />

            {/* Real Performance Overview */}
            <div className="mt-8 bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>Real Performance Overview</span>
              </h3>
              {performanceLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              ) : performance ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {performance.totalReturn >= 0 ? '+' : ''}{performance.totalReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">Total Return</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{performance.totalTrades}</div>
                    <div className="text-xs text-gray-400">Total Trades</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {performance.totalTrades > 0 ? ((performance.profitableTrades / performance.totalTrades) * 100).toFixed(1) : '0.0'}%
                    </div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No trading sessions found. Start trading to see your performance!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
