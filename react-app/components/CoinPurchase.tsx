import { Coins, Send, ExternalLink } from 'lucide-react';
import { useProfile } from '@/react-app/hooks/useAPI';

export default function CoinPurchase() {
  const { profile } = useProfile();

  const handleTelegramPurchase = () => {
    window.open('https://t.me/LetsLCC_bot', '_blank');
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span>LC Coins</span>
        </h2>
        
        <div className="text-2xl font-bold text-yellow-400">
          {profile?.lc_coins || 0}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Purchase LC Coins</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            Purchase LC coins through our Telegram bot. Rate: R3 = 1 LC coin
          </div>
          <button
            onClick={handleTelegramPurchase}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Buy LC Coins on Telegram</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>LC Coins are used for daily subscription access to trading features. 1 LC = R3 value.</p>
        </div>
      </div>
    </div>
  );
}
