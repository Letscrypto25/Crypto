import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { Bot, Zap, Settings, Crown, ArrowRight, Lock } from 'lucide-react';
import { useSubscription } from '@/react-app/hooks/useAPI';

export default function BotVersionSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [selectedVersion, setSelectedVersion] = useState<'simple' | 'complex' | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const hasProAccess = subscription?.subscription_tier === 'pro' && subscription?.is_active;

  const handleVersionSelect = (version: 'simple' | 'complex') => {
    if (version === 'complex' && !hasProAccess) {
      return; // Don't allow selection if no pro access
    }
    setSelectedVersion(version);
  };

  const handleContinue = () => {
    if (selectedVersion) {
      navigate(`/dashboard/${selectedVersion}`);
      localStorage.setItem('cryptoMindBotVersion', selectedVersion);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 w-full max-w-4xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bot className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Choose Your Trading Experience
          </h1>
          <p className="text-gray-400">
            Select the bot interface that best fits your trading style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Simple Bot */}
          <div
            onClick={() => handleVersionSelect('simple')}
            className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
              selectedVersion === 'simple'
                ? 'border-purple-500 bg-purple-500/10 scale-105'
                : 'border-purple-500/20 bg-slate-700/50 hover:border-purple-500/40 hover:bg-purple-500/5'
            }`}
          >
            <div className="text-center mb-4">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Simple Bot</h3>
              <p className="text-sm text-gray-400">Perfect for beginners and quick trading</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Easy-to-use interface</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Pre-configured strategies</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Quick setup</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Available with any subscription</span>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-2 inline-block">
                <span className="text-purple-300 text-sm font-medium">Recommended for beginners</span>
              </div>
            </div>
          </div>

          {/* Complex Bot */}
          <div
            onClick={() => handleVersionSelect('complex')}
            className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
              !hasProAccess
                ? 'border-gray-500/20 bg-gray-500/5 cursor-not-allowed opacity-75'
                : selectedVersion === 'complex'
                ? 'border-blue-500 bg-blue-500/10 scale-105'
                : 'border-blue-500/20 bg-slate-700/50 hover:border-blue-500/40 hover:bg-blue-500/5'
            }`}
          >
            {!hasProAccess && (
              <div className="absolute top-3 right-3">
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full p-1">
                  <Lock className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            )}

            <div className="text-center mb-4">
              <div className={`inline-flex p-4 rounded-full text-white mb-4 ${
                hasProAccess 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
              }`}>
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Complex Bot</h3>
              <p className="text-sm text-gray-400">Advanced trading with full customization</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className={`w-2 h-2 rounded-full ${hasProAccess ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                <span>Advanced strategy builder</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className={`w-2 h-2 rounded-full ${hasProAccess ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                <span>Custom indicators & parameters</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className={`w-2 h-2 rounded-full ${hasProAccess ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                <span>Advanced risk management</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className={`w-2 h-2 rounded-full ${hasProAccess ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                <span>Portfolio optimization</span>
              </div>
            </div>

            <div className="text-center">
              {hasProAccess ? (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 inline-block">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-blue-300 text-sm font-medium">Pro Access</span>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2 inline-block">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">Pro Subscription Required</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedVersion}
            className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedVersion
                ? selectedVersion === 'simple'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25'
                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Continue with {selectedVersion === 'simple' ? 'Simple' : selectedVersion === 'complex' ? 'Complex' : 'Selected'} Bot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {!hasProAccess && (
            <p className="text-xs text-yellow-400 mt-4">
              Upgrade to Pro subscription to unlock the Complex Bot experience
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
