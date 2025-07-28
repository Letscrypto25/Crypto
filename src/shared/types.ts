import z from "zod";

export const UserProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  lc_coins: z.number(),
  total_earned_coins: z.number(),
  bot_active: z.boolean(),
  luna_api_key: z.string().nullable(),
  luna_api_secret: z.string().nullable(),
  luno_balance_zar: z.number().nullable(),
  luno_balance_btc: z.number().nullable(),
  luno_balance_eth: z.number().nullable(),
  luno_balance_hbar: z.number().nullable(),
  luno_last_sync: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TradingStrategySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  lc_cost: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const UserBotConfigSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  strategy_id: z.number(),
  is_active: z.boolean(),
  config_data: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TradingSessionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  strategy_id: z.number(),
  start_time: z.string(),
  end_time: z.string().nullable(),
  profit_loss: z.number(),
  trades_count: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const UserSubscriptionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  subscription_tier: z.string(),
  daily_cost: z.number(),
  last_charged_date: z.string().nullable(),
  is_active: z.boolean(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SubscriptionTierSchema = z.object({
  id: z.number(),
  name: z.string(),
  display_name: z.string(),
  daily_cost: z.number(),
  features: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type TradingStrategy = z.infer<typeof TradingStrategySchema>;
export type UserBotConfig = z.infer<typeof UserBotConfigSchema>;
export type TradingSession = z.infer<typeof TradingSessionSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;
