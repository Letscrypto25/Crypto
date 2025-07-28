import { useState } from 'react';
import { Crown, Zap, TrendingUp, BarChart3, Bell, Coins } from 'lucide-react';
import type { SubscriptionTier } from '@/shared/types';
import { useSubscription, useProfile } from '@/react-app/hooks/useAPI';

interface SubscriptionTiersProps {
  tiers: SubscriptionTier[];
}

export default function SubscriptionTiers({ tiers }: SubscriptionTiersProps) {
  const { subscription, activateSubscription } = useSubscription();
  const { profile } = useProfile();
  const [isActivating, setIsActivating] = useState<string | null>(null);

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'basic':
        return <Zap className="w-6 h-6" />;
      case 'premium':
        return <TrendingUp className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'basic':
        return 'from-blue-600 to-cyan-600';
      case 'premium':
        return 'from-purple-600 to-pink-600';
      case 'pro':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-blue-600 to-cyan-600';
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'auto_trading':
        return <Zap className="w-4 h-4" />;
      case 'trade_stats':
        return <BarChart3 className="w-4 h-4" />;
      case 'leaderboard':
        return <TrendingUp className="w-4 h-4" />;
      case 'multi_coin':
        return <Coins className="w-4 h-4" />;
      case 'telegram_alerts':
        return <Bell className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'auto_trading':
        return 'Automated Trading';
      case 'trade_stats':
        return 'Trade Statistics';
      case 'leaderboard':
        return 'Leaderboard Access';
      case 'multi_coin':
        return 'Multi-Coin Trading';
      case 'telegram_alerts':
        return 'Telegram Alerts';
      default:
        return feature;
    }
  };

  const handleActivateTier = async (tier: SubscriptionTier) => {
    if (!profile || profile.lc_coins < tier.daily_cost || isActivating) return;
    
    setIsActivating(tier.name);
    try {
      await activateSubscription(tier.name);
    } finally {
      setIsActivating(null);
    }
  };

  const canAfford = (dailyCost: number) => {
    return profile && profile.lc_coins >= dailyCost;
  };

  const isCurrentTier = (tierName: string) => {
    return subscription?.subscription_tier === tierName && subscription?.is_active;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
          <Crown className="w-6 h-6 text-yellow-400" />
          <span>Subscription Tiers</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Choose your trading level. Daily charges automatically deducted from your LC balance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const features = JSON.parse(tier.features) as string[];
          const isActive = isCurrentTier(tier.name);
          const affordable = canAfford(tier.daily_cost);

          return (
            <div
              key={tier.id}
              className={`relative bg-slate-700/50 border rounded-lg p-4 transition-all duration-200 ${
                isActive
                  ? 'border-yellow-500/50 bg-yellow-500/10'
                  : 'border-slate-600/50 hover:border-purple-500/50'
              }`}
            >
              {isActive && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    ACTIVE
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${getTierColor(tier.name)} text-white mb-3`}>
                  {getTierIcon(tier.name)}
                </div>
                <h3 className="text-lg font-semibold text-white">{tier.display_name}</h3>
                <p className="text-xs text-gray-400 mt-1">{tier.description}</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-white">
                  {tier.daily_cost} LC
                </div>
                <div className="text-xs text-gray-400">
                  per day (R{(tier.daily_cost * 3).toFixed(0)})
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2 text-sm text-gray-300">
                    <div className="text-green-400">
                      {getFeatureIcon(feature)}
                    </div>
                    <span>{getFeatureName(feature)}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleActivateTier(tier)}
                disabled={isActive || !affordable || isActivating === tier.name}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                    : affordable
                    ? `bg-gradient-to-r ${getTierColor(tier.name)} hover:opacity-90 text-white shadow-lg`
                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed border border-gray-500/20'
                }`}
              >
                {isActivating === tier.name ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Activating...</span>
                  </div>
                ) : isActive ? (
                  'Active Plan'
                ) : affordable ? (
                  'Activate'
                ) : (
                  'Insufficient LC'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {subscription?.is_active && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="text-sm text-green-300">
            <div className="flex items-center justify-between">
              <span>Current Plan: {subscription.subscription_tier}</span>
              <span>{subscription.daily_cost} LC/day</span>
            </div>
            {subscription.expires_at && (
              <div className="text-xs text-green-400 mt-1">
                Next charge: {new Date(subscription.expires_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
