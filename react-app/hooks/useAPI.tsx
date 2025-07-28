import React, { useState, useEffect, createContext, useContext } from 'react';
import type { UserProfile, TradingStrategy, UserSubscription, SubscriptionTier } from '@/shared/types';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  updateBalance: (balanceData: {
    zar?: number;
    btc?: number;
    eth?: number;
    hbar?: number;
    lastSync?: string | null;
  }) => void;
  updateLunaCredentials: (apiKey: string, apiSecret: string) => Promise<void>;
  resetLunaCredentials: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  fetchProfile: async () => {},
  updateBalance: () => {},
  updateLunaCredentials: async () => {},
  resetLunaCredentials: async () => {}
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      console.log('useAPI: Fetching profile...');
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('useAPI: Profile fetched successfully:', data);
        setProfile(data);
      } else if (response.status === 401) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (balanceData: {
    zar?: number;
    btc?: number;
    eth?: number;
    hbar?: number;
    lastSync?: string | null;
  }) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        luno_balance_zar: balanceData.zar ?? profile.luno_balance_zar,
        luno_balance_btc: balanceData.btc ?? profile.luno_balance_btc,
        luno_balance_eth: balanceData.eth ?? profile.luno_balance_eth,
        luno_balance_hbar: balanceData.hbar ?? profile.luno_balance_hbar,
        luno_last_sync: balanceData.lastSync ?? profile.luno_last_sync,
      };
      
      console.log('useAPI - Balance update:', {
        oldValues: {
          zar: profile.luno_balance_zar,
          btc: profile.luno_balance_btc,
          eth: profile.luno_balance_eth,
          hbar: profile.luno_balance_hbar,
        },
        newValues: {
          zar: updatedProfile.luno_balance_zar,
          btc: updatedProfile.luno_balance_btc,
          eth: updatedProfile.luno_balance_eth,
          hbar: updatedProfile.luno_balance_hbar,
        },
        receivedData: balanceData
      });
      
      setProfile(updatedProfile);
    } else {
      console.warn('useAPI - Cannot update balance: Profile is null');
    }
  };

  const updateLunaCredentials = async (apiKey: string, apiSecret: string) => {
    try {
      const response = await fetch('/api/profile/luna-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret }),
      });
      if (response.ok) {
        await fetchProfile();
      }
    } catch (error) {
      console.error('Failed to update Luna credentials:', error);
    }
  };

  const resetLunaCredentials = async () => {
    try {
      const response = await fetch('/api/profile/luna-credentials', {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchProfile();
      }
    } catch (error) {
      console.error('Failed to reset Luna credentials:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleBalanceUpdate = (event: CustomEvent) => {
      if (!isMounted || !event.detail) return;
      
      console.log('useAPI: Balance update event received with data:', event.detail);
      
      setProfile(prevProfile => {
        if (!prevProfile) return prevProfile;
        
        const newZar = event.detail.zar ?? prevProfile.luno_balance_zar;
        const newBtc = event.detail.btc ?? prevProfile.luno_balance_btc;
        const newEth = event.detail.eth ?? prevProfile.luno_balance_eth;
        const newHbar = event.detail.hbar ?? prevProfile.luno_balance_hbar;
        const newLastSync = event.detail.lastSync ?? prevProfile.luno_last_sync;

        if (
          newZar !== prevProfile.luno_balance_zar ||
          newBtc !== prevProfile.luno_balance_btc ||
          newEth !== prevProfile.luno_balance_eth ||
          newHbar !== prevProfile.luno_balance_hbar
        ) {
          const updatedProfile = {
            ...prevProfile,
            luno_balance_zar: newZar,
            luno_balance_btc: newBtc,
            luno_balance_eth: newEth,
            luno_balance_hbar: newHbar,
            luno_last_sync: newLastSync,
          };
          console.log('useAPI: Applying balance update:', updatedProfile);
          return updatedProfile;
        }
        
        return prevProfile;
      });
    };

    fetchProfile();
    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    
    return () => {
      isMounted = false;
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, []);

  return React.createElement(ProfileContext.Provider, { value: { profile, loading, fetchProfile, updateBalance, updateLunaCredentials, resetLunaCredentials } }, children);
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export function useBot() {
  const [botStatus, setBotStatus] = useState<{
    botActive: boolean;
    activeStrategies: any[];
  }>({ botActive: false, activeStrategies: [] });
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status');
      if (response.ok) {
        const data = await response.json();
        setBotStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
  }, [profile?.luno_balance_zar]);

  const toggleBot = async (activate: boolean) => {
    try {
      const response = await fetch('/api/bot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate }),
      });
      if (response.ok) {
        await fetchBotStatus();
      }
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  const activateStrategy = async (strategyId: number, config?: any) => {
    try {
      const response = await fetch('/api/bot/activate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId, config }),
      });
      if (response.ok) {
        await fetchBotStatus();
      }
    } catch (error) {
      console.error('Failed to activate strategy:', error);
    }
  };

  return { botStatus, loading, toggleBot, activateStrategy, fetchBotStatus };
}

export function useStrategies() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch('/api/strategies');
        if (response.ok) {
          const data = await response.json();
          setStrategies(data);
        }
      } catch (error) {
        console.error('Failed to fetch strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  return { strategies, loading };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/subscription/tiers');
      if (response.ok) {
        const data = await response.json();
        setTiers(data);
      }
    } catch (error) {
      console.error('Failed to fetch tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchTiers();
  }, []);

  const activateSubscription = async (tierName: string) => {
    try {
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierName }),
      });
      if (response.ok) {
        await fetchSubscription();
      }
    } catch (error) {
      console.error('Failed to activate subscription:', error);
    }
  };

  return { subscription, tiers, loading, activateSubscription, fetchSubscription };
}

export function useTradingPerformance() {
  const [performance, setPerformance] = useState<{
    totalReturn: number;
    totalTrades: number;
    profitableTrades: number;
    averageReturn: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetch('/api/trading/performance');
        if (response.ok) {
          const data = await response.json();
          setPerformance(data);
        }
      } catch (error) {
        console.error('Failed to fetch trading performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  return { performance, loading };
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar: string;
  weekly_profit: number;
  weekly_trades: number;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard/weekly');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { leaderboard, loading };
}
