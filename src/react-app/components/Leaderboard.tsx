import { useLeaderboard } from '@/react-app/hooks/useAPI';
import { Trophy, TrendingUp, User } from 'lucide-react';

interface LeaderboardProps {
  isComplex?: boolean;
}

export default function Leaderboard({ isComplex = false }: LeaderboardProps) {
  const { leaderboard, loading } = useLeaderboard();

  const gradientFrom = isComplex ? 'from-blue-600' : 'from-purple-600';
  const gradientTo = isComplex ? 'to-cyan-600' : 'to-pink-600';
  const borderColor = isComplex ? 'border-blue-500/20' : 'border-purple-500/20';
  const iconColor = isComplex ? 'text-blue-400' : 'text-purple-400';

  if (loading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-xl border ${borderColor} rounded-xl p-6`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <Trophy className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">1</div>;
      case 2:
        return <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-black font-bold text-sm">2</div>;
      case 3:
        return <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-black font-bold text-sm">3</div>;
      default:
        return <div className="w-8 h-8 bg-slate-600/50 rounded-full flex items-center justify-center text-gray-300 font-bold text-sm">{rank}</div>;
    }
  };

  const getRankGlow = (rank: number) => {
    switch (rank) {
      case 1:
        return 'shadow-lg shadow-yellow-500/20';
      case 2:
        return 'shadow-lg shadow-gray-500/20';
      case 3:
        return 'shadow-lg shadow-orange-500/20';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-xl border ${borderColor} rounded-xl p-6`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
          <Trophy className={`w-6 h-6 ${iconColor}`} />
          <span>Weekly Leaderboard</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Top traders this week based on profit percentage
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No trading data this week yet.</p>
          <p className="text-gray-500 text-sm">Start trading to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((trader, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
              <div
                key={trader.user_id}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                  isTopThree 
                    ? `bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-opacity-10 border border-current border-opacity-20 ${getRankGlow(rank)}`
                    : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {trader.avatar ? (
                    <img
                      src={trader.avatar}
                      alt={trader.username}
                      className="w-10 h-10 rounded-full border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium truncate">{trader.username}</h3>
                    {rank <= 3 && (
                      <TrendingUp className={`w-4 h-4 ${
                        rank === 1 ? 'text-yellow-400' : 
                        rank === 2 ? 'text-gray-400' : 'text-orange-400'
                      }`} />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {trader.weekly_trades} trade{trader.weekly_trades !== 1 ? 's' : ''} this week
                  </p>
                </div>

                {/* Profit */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    trader.weekly_profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trader.weekly_profit >= 0 ? '+' : ''}{trader.weekly_profit.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">profit</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly Reset Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Leaderboard resets every Monday at 00:00 UTC
        </p>
      </div>
    </div>
  );
}
