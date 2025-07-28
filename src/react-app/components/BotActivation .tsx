import { useState, useEffect } from 'react';
import { Play, StopCircle } from 'lucide-react';
import { useProfile } from '@/react-app/hooks/useAPI';
import { useBot } from '@/react-app/hooks/useAPI';

export default function BotActivationPanel() {
  const { profile } = useProfile();
  const { botStatus, loading: botLoading, toggleBot } = useBot();
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

  // Get the actual ZAR balance from profile
  const zarBalance = profile?.luno_balance_zar || 0;
  
  // Handle bot toggle
  const handleToggleBot = async () => {
    if (zarBalance <= 0) {
      setError('Insufficient ZAR balance to activate bot');
      return;
    }
    
    setActivating(true);
    setError('');
    
    try {
      await toggleBot(!botStatus.botActive);
    } catch (err) {
      setError('Failed to toggle bot status');
      console.error('Bot toggle error:', err);
    } finally {
      setActivating(false);
    }
  };

  // Show error only for 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xs">🤖</span>
          </div>
          <span>Trading Bot</span>
        </h2>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">
            Balance: <span className="text-green-400">R {zarBalance.toFixed(2)}</span>
          </span>
          <button
            onClick={handleToggleBot}
            disabled={activating || botLoading || zarBalance <= 0}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              botStatus.botActive
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
            } transition-all disabled:opacity-50`}
          >
            {activating ? (
              <div className="flex items-center">
                <span className="animate-spin mr-2">↻</span>
                {botStatus.botActive ? 'Stopping...' : 'Starting...'}
              </div>
            ) : botStatus.botActive ? (
              <>
                <StopCircle className="w-4 h-4" />
                <span>Stop Bot</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Bot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        {zarBalance <= 0 ? (
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">⚠️</span>
            <span>Fund your Luno ZAR wallet to activate the trading bot</span>
          </div>
        ) : botStatus.botActive ? (
          <div className="flex items-center text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span>Bot is actively trading with your R {zarBalance.toFixed(2)} balance</span>
          </div>
        ) : (
          <div className="text-gray-500">
            Bot is currently inactive. Your funds are safe in your wallet.
          </div>
        )}
      </div>
    </div>
  );
}