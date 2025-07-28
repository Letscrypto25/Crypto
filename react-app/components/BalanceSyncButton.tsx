import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useProfile } from '@/react-app/hooks/useAPI';

interface BalanceSyncButtonProps {
  onSyncComplete?: () => void;
  compact?: boolean;
}

export default function BalanceSyncButton({ onSyncComplete, compact = false }: BalanceSyncButtonProps) {
  const { profile, updateBalance } = useProfile();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasCredentials = profile?.luna_api_key && profile?.luna_api_secret;

  const syncBalance = async () => {
    if (!hasCredentials || syncing) return;
    
    setSyncing(true);
    setSyncStatus('idle');
    setErrorMessage('');
    
    try {
      console.log('BalanceSyncButton: Starting balance sync...');
      
      const response = await fetch('/api/luno/balance', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('BalanceSyncButton: API response:', data);
      
      if (response.ok && data.success) {
        setSyncStatus('success');
        
        // Create properly structured balance data
        const balanceData = {
          zar: data.zar || 0,
          btc: data.btc || 0,
          eth: data.eth || 0,
          hbar: data.hbar || 0,
          lastSync: data.lastSync || new Date().toISOString()
        };
        
        console.log('BalanceSyncButton: Updating balance with:', balanceData);
        
        // Critical fix: Update the profile state via useProfile hook
        updateBalance(balanceData);
        
        // Trigger callback
        onSyncComplete?.();
        
        // Reset status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
        
        console.log('BalanceSyncButton: Balance sync completed successfully');
      } else {
        setSyncStatus('error');
        let errorMsg = data.error || 'Failed to sync balance';
        
        if (response.status === 401) {
          errorMsg = 'Please log in again to sync your balance.';
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else if (errorMsg.includes('API key not found') || errorMsg.includes('Invalid')) {
          errorMsg = 'Invalid Luno API credentials. Please check your API key and secret in settings.';
        } else if (errorMsg.includes('permission')) {
          errorMsg = 'API key does not have balance access permissions. Check your Luno API settings.';
        } else if (errorMsg.includes('Network error')) {
          errorMsg = 'Unable to connect to Luno. Check your internet connection.';
        }
        
        setErrorMessage(errorMsg);
        console.error('BalanceSyncButton: Balance sync failed:', errorMsg);
      }
    } catch (error) {
      console.error('BalanceSyncButton: Balance sync error:', error);
      setSyncStatus('error');
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (!hasCredentials) {
    return compact ? null : (
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
        <div className="text-xs text-orange-300">
          Configure Luno API credentials to sync balance
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={syncBalance}
        disabled={syncing}
        className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
          syncStatus === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : syncStatus === 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
        } disabled:opacity-50`}
        title={syncing ? 'Syncing balance...' : syncStatus === 'error' ? errorMessage : 'Sync Luno balance'}
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={syncBalance}
        disabled={syncing}
        className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          syncStatus === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : syncStatus === 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
        } disabled:opacity-50`}
      >
        {syncStatus === 'success' ? (
          <CheckCircle className="w-4 h-4" />
        ) : syncStatus === 'error' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        )}
        <span>
          {syncing 
            ? 'Syncing Balance...' 
            : syncStatus === 'success' 
            ? 'Balance Synced!' 
            : syncStatus === 'error'
            ? 'Sync Failed'
            : 'Refresh Balance'
          }
        </span>
      </button>
      
      {syncStatus === 'error' && errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          <div className="text-xs text-red-300">{errorMessage}</div>
        </div>
      )}
    </div>
  );
}