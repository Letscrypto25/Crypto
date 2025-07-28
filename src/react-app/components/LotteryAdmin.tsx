import { useState } from 'react';
import { PlayCircle, Calendar, Trophy, AlertCircle } from 'lucide-react';

export default function LotteryAdmin() {
  const [drawLoading, setDrawLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const runDraw = async (drawType: 'weekly' | 'monthly') => {
    if (!confirm(`Are you sure you want to run the ${drawType} lottery draw? This action cannot be undone.`)) {
      return;
    }

    setDrawLoading(drawType);
    setMessage('');

    try {
      const response = await fetch(`/api/lottery/draw/${drawType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMessage(`✅ ${drawType.charAt(0).toUpperCase() + drawType.slice(1)} draw completed successfully!`);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error || 'Failed to run draw'}`);
      }
    } catch (error) {
      console.error('Draw error:', error);
      setMessage(`❌ Error: Failed to run ${drawType} draw`);
    } finally {
      setDrawLoading(null);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Lottery Administration</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Admin Only</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Run lottery draws manually. This will process all pending tickets and distribute winnings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => runDraw('weekly')}
              disabled={drawLoading === 'weekly'}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm font-medium py-3 px-4 rounded-lg transition-all"
            >
              {drawLoading === 'weekly' ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Run Weekly Draw</span>
                </>
              )}
            </button>

            <button
              onClick={() => runDraw('monthly')}
              disabled={drawLoading === 'monthly'}
              className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white text-sm font-medium py-3 px-4 rounded-lg transition-all"
            >
              {drawLoading === 'monthly' ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Run Monthly Draw</span>
                </>
              )}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.startsWith('✅') 
              ? 'bg-green-500/10 border border-green-500/20 text-green-300'
              : 'bg-red-500/10 border border-red-500/20 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-slate-700/30 border border-gray-600/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-2 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>How the Lottery Works</span>
          </h3>
          <div className="text-xs text-gray-400 space-y-2">
            <div><strong>Weekly Draw (3 numbers, 1-30):</strong></div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tickets cost 5 LC coins</li>
              <li>Match all 3: Share 60% of pool</li>
              <li>Match 2: Get money back (refund)</li>
              <li>30% goes to monthly pool</li>
              <li>10% owner profit</li>
            </ul>
            
            <div className="mt-3"><strong>Monthly Draw (5 numbers, 1-50):</strong></div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tickets cost 10 LC coins</li>
              <li>Match all 5: Share 80% of pool</li>
              <li>12% owner profit</li>
              <li>8% carryover to next month</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
