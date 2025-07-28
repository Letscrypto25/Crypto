import { useState } from 'react';
import { Key, AlertCircle, CheckCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useProfile } from '@/react-app/hooks/useAPI';

export default function LunaApiSettings() {
  const { profile, updateLunaCredentials, resetLunaCredentials } = useProfile();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const hasCredentials = profile?.luna_api_key && profile?.luna_api_secret;

  const handleSave = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) return;
    
    setIsUpdating(true);
    try {
      await updateLunaCredentials(apiKey.trim(), apiSecret.trim());
      setApiKey('');
      setApiSecret('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset your Luna API credentials? This will remove your current credentials and you will need to re-enter them.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      await resetLunaCredentials();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Key className="w-5 h-5 text-blue-400" />
          <span>Luna API Settings</span>
        </h2>
        
        {hasCredentials && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Configured</span>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center space-x-1 text-xs text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset'}</span>
            </button>
          </div>
        )}
      </div>

      {!hasCredentials && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-orange-300">
            Luna API credentials are required to activate the trading bot. Please enter your API key and secret below.
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasCredentials ? "API Key configured" : "Enter your Luna API key"}
            disabled={!!hasCredentials}
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Secret
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder={hasCredentials ? "API Secret configured" : "Enter your Luna API secret"}
              disabled={!!hasCredentials}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 pr-10 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!hasCredentials && (
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {!hasCredentials && (
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || !apiSecret.trim() || isUpdating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            {isUpdating ? 'Saving...' : 'Save API Credentials'}
          </button>
        )}

        {hasCredentials && (
          <div className="text-xs text-gray-500">
            <p>✓ Your Luna API credentials are securely stored. The bot can now execute trades on your behalf.</p>
          </div>
        )}
      </div>
    </div>
  );
}
