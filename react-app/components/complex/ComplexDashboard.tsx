import { useStrategies, useSubscription, useTradingPerformance } from '@/react-app/hooks/useAPI';
import ComplexHeader from '@/react-app/components/complex/ComplexHeader';
import ComplexBotControl from '@/react-app/components/complex/ComplexBotControl';
import ComplexStrategyBuilder from '@/react-app/components/complex/ComplexStrategyBuilder';
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
import { BarChart3, Brain, Activity, Target } from 'lucide-react';

export default function ComplexDashboard() {
  const { strategies, loading } = useStrategies();
  const { tiers, loading: tiersLoading } = useSubscription();
  const { performance, loading: performanceLoading } = useTradingPerformance();

  if (loading || tiersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <ComplexHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <ComplexHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bot Control & Settings */}
          <div className="space-y-6">
            <ComplexBotControl />
            <LunaApiSettings />
            <LunoBalance />
            <div className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-blue-300 mb-3 flex items-center justify-between">
                <span>Quick Actions</span>
                <BalanceSyncButton compact={true} />
              </h3>
              <BalanceSyncButton />
            </div>
            
            <MarketSelector isComplex={true} />
            <LotteryAdmin />
            <CoinPurchase />
          </div>

          {/* Right Column - Strategy Builder & Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Market Overview */}
            <MarketOverview isComplex={true} />

            {/* Weekly Leaderboard */}
            <Leaderboard isComplex={true} />

            {/* Lottery System */}
            <LotterySystem />

            {/* Subscription Tiers */}
            <SubscriptionTiers tiers={tiers} />

            {/* Strategy Builder */}
            <ComplexStrategyBuilder strategies={strategies} />

            {/* Advanced Analytics */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Advanced Analytics Dashboard</span>
              </h3>
              
              {performanceLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              ) : performance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {performance.totalReturn >= 0 ? '+' : ''}{performance.totalReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">Total Return</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{performance.totalTrades}</div>
                    <div className="text-xs text-gray-400">Total Trades</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {performance.totalTrades > 0 ? ((performance.profitableTrades / performance.totalTrades) * 100).toFixed(1) : '0.0'}%
                    </div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {performance.averageReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">Avg Return</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No trading data available. Start trading to see advanced analytics!</p>
                </div>
              )}

              {/* Portfolio Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 border border-blue-500/10 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Portfolio Distribution</span>
                  </h4>
                  <div className="space-y-2">
                    {['BTC', 'ETH', 'ADA', 'SOL', 'DOT'].map((coin, index) => (
                      <div key={coin} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{coin}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                              style={{ width: `${[45, 25, 15, 10, 5][index]}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-400 w-8">{[45, 25, 15, 10, 5][index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/30 border border-blue-500/10 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Strategy Performance</span>
                  </h4>
                  <div className="space-y-2">
                    {['Grid Trading', 'Mean Reversion', 'Momentum', 'Arbitrage'].map((strategy, index) => (
                      <div key={strategy} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{strategy}</span>
                        <span className={`font-medium ${['+12.3%', '+8.7%', '+15.2%', '+6.1%'][index].startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {['+12.3%', '+8.7%', '+15.2%', '+6.1%'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
