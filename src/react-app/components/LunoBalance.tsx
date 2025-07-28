import { useState, useEffect } from 'react';
import { Wallet, RefreshCw, AlertCircle, Bitcoin } from 'lucide-react';
import { useProfile } from '@/react-app/hooks/useAPI';

// Added zar to the interface
interface LunoBalanceData {
  btc: number;
  eth: number;
  hbar: number;
  zar: number; // Added ZAR balance
  lastSync: string | null;
}

// Helper function to transform Luno API response
const transformLunoResponse = (data: any) => {
  const mapping: Record<string, string> = {
    'XBT': 'btc',
    'BTC': 'btc',
    'ZAR': 'zar',
    'ETH': 'eth',
    'HBAR': 'hbar'
  };

  const transformed: Record<string, number> = { btc: 0, eth: 0, hbar: 0, zar: 0 };

  // Process each asset in the balance array
  data.balance?.forEach((asset: any) => {
    const key = mapping[asset.asset];
    if (key) {
      const value = parseFloat(asset.balance) || 0;
      // Only update if we have a positive balance
      transformed[key] = value > 0 ? value : transformed[key];
    }
  });

  return transformed;
};

export default function LunoBalance() {
  const { profile, updateBalance } = useProfile();
  const [balance, setBalance] = useState<LunoBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCredentials = profile?.luna_api_key && profile?.luna_api_secret;

  const fetchBalance = async () => {
    if (!hasCredentials || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/luno/balance', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Transform the API response to get actual balances
        const transformedData = transformLunoResponse(data.rawApiResponse || data);
        
        // Create proper balance data with actual values
        const balanceData = {
          btc: transformedData.btc || 0,
          eth: transformedData.eth || 0,
          hbar: transformedData.hbar || 0,
          zar: transformedData.zar || 0,
          lastSync: data.lastSync
        };
        
        console.log('API Response - Transformed balance data:', balanceData);
        
        setBalance(balanceData);
        
        // Update the global profile state
        const balanceUpdate = {
          zar: balanceData.zar,
          btc: balanceData.btc,
          eth: balanceData.eth,
          hbar: balanceData.hbar,
          lastSync: balanceData.lastSync
        };
        
        console.log('Updating global profile state with:', balanceUpdate);
        updateBalance(balanceUpdate);
      } else {
        let errorMessage = data.error || 'Failed to fetch balance';
        
        if (response.status === 401) {
          errorMessage = 'Please log in again to sync your balance.';
          // Redirect to login if unauthorized
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else if (errorMessage.includes('Invalid') || errorMessage.includes('API key')) {
          errorMessage = errorMessage + ' Consider resetting your credentials in the Luna API Settings section.';
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Balance fetch error:', err);
      setError('Network error occurred. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasCredentials) {
      // Load cached balance from profile
      if (profile) {
        setBalance({
          btc: profile.luno_balance_btc || 0,
          eth: profile.luno_balance_eth || 0,
          hbar: profile.luno_balance_hbar || 0,
          zar: profile.luno_balance_zar || 0, // Added ZAR
          lastSync: profile.luno_last_sync || null
        });
      }
      
      // Auto-fetch on component mount only if we don't have recent data
      const shouldAutoFetch = !profile?.luno_last_sync || 
        (new Date().getTime() - new Date(profile.luno_last_sync).getTime()) > 5 * 60 * 1000; // 5 minutes
      
      if (shouldAutoFetch) {
        fetchBalance();
      }
    }
  }, [hasCredentials, profile]); // Added profile to dependencies

  const formatCrypto = (amount: number, symbol: string) => {
    if (amount === 0) return `0.00000000 ${symbol}`;
    
    // For very small amounts, show full precision
    if (amount < 0.00000001) {
      return `${amount.toFixed(12)} ${symbol}`;
    }
    
    // For regular amounts, use 8 decimal places but trim unnecessary zeros
    const formatted = amount.toFixed(8);
    const trimmed = formatted.replace(/\.?0+$/, '');
    return `${trimmed} ${symbol}`;
  };

  // Format ZAR balance properly
  const formatZar = (amount: number) => {
    return `R ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getLastSyncText = (lastSync: string | null) => {
    if (!lastSync) return 'Never synced';
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return syncDate.toLocaleDateString();
  };

  if (!hasCredentials) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-orange-400" />
            <span>Luno Balance</span>
          </h2>
        </div>
        
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-orange-300">
            Configure your Luno API credentials to view your account balance.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-orange-400" />
          <span>Luno Balance</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          {balance?.lastSync && (
            <span className="text-xs text-gray-400">
              {getLastSyncText(balance.lastSync)}
            </span>
          )}
          <button
            onClick={fetchBalance}
            disabled={loading}
            className={`p-2 rounded-lg transition-all duration-200 ${
              loading 
                ? 'bg-orange-500/20 text-orange-400 cursor-not-allowed'
                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300'
            }`}
            title="Refresh balance from Luno"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-300">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        {/* ZAR Balance */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">R</span>
              </div>
              <span className="text-sm font-medium text-green-300">ZAR</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">
                {balance ? formatZar(balance.zar) : '---'}
              </div>
              <div className="text-xs text-gray-400">South African Rand</div>
            </div>
          </div>
        </div>
        
        {/* BTC Balance */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bitcoin className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">BTC</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-400">
                {balance ? formatCrypto(balance.btc, 'BTC') : '---'}
              </div>
              <div className="text-xs text-gray-400">Bitcoin</div>
            </div>
          </div>
        </div>

        {/* ETH Balance */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">Ξ</span>
              </div>
              <span className="text-sm font-medium text-blue-300">ETH</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">
                {balance ? formatCrypto(balance.eth, 'ETH') : '---'}
              </div>
              <div className="text-xs text-gray-400">Ethereum</div>
            </div>
          </div>
        </div>

        {/* HBAR Balance */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">ℏ</span>
              </div>
              <span className="text-sm font-medium text-purple-300">HBAR</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-400">
                {balance ? formatCrypto(balance.hbar, 'HBAR') : '---'}
              </div>
              <div className="text-xs text-gray-400">Hedera Hashgraph</div>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="pt-2 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Last updated: {balance ? getLastSyncText(balance.lastSync) : 'Never'}
            </span>
            {!loading && !error && (
              <button
                onClick={fetchBalance}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                Sync now
              </button>
            )}
          </div>
          {error && (
            <div className="mt-2 text-xs text-red-400">
              Sync failed. Click refresh to try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}