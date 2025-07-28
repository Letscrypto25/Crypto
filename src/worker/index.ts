import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
  getCurrentUser,
} from "@getmocha/users-service/backend";

type Env = {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all requests
app.use('/*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }
  
  await next();
});

// Custom auth middleware that uses the Users Service
const createAuthMiddleware = () => {
  return async (c: any, next: any) => {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    
    if (!sessionToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    try {
      const user = await getCurrentUser(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });
      
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      
      c.set('user', user);
      await next();
    } catch (error) {
      console.error('Auth error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }
  };
};

// OAuth routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  try {
    const redirectUrl = await getOAuthRedirectUrl('google', {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    return c.json({ redirectUrl }, 200);
  } catch (error) {
    console.error('OAuth redirect URL error:', error);
    return c.json({ error: 'Failed to get redirect URL' }, 500);
  }
});

app.post("/api/sessions", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }

    console.log('Exchanging code for session token...');
    console.log('API URL:', c.env.MOCHA_USERS_SERVICE_API_URL);
    console.log('Has API Key:', !!c.env.MOCHA_USERS_SERVICE_API_KEY);

    const sessionToken = await exchangeCodeForSessionToken(body.code, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    console.log('Session token received:', !!sessionToken);

    // Set cookie with proper OAuth settings
    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ success: true }, 200);
  } catch (error: any) {
    console.error('Session exchange error details:', error);
    return c.json({ error: 'Failed to exchange code for session', details: error.message }, 500);
  }
});

app.get("/api/users/me", createAuthMiddleware(), async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    try {
      await deleteSession(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Initialize trading strategies if they don't exist
async function initializeStrategies(db: D1Database) {
  try {
    const count = await db.prepare('SELECT COUNT(*) as count FROM trading_strategies').first() as { count: number } | null;
    
    if (!count || count.count === 0) {
      const strategies = [
        { name: 'Grid Trading', description: 'Automated grid trading strategy that places buy and sell orders at regular intervals', lc_cost: 0 },
        { name: 'DCA Bot', description: 'Dollar Cost Averaging strategy that buys at regular intervals regardless of price', lc_cost: 0 },
        { name: 'Momentum Trading', description: 'Advanced strategy that follows market momentum and trends', lc_cost: 0 },
        { name: 'Arbitrage Bot', description: 'Exploits price differences across different exchanges', lc_cost: 0 },
        { name: 'Mean Reversion', description: 'Strategy that bets on price returning to historical averages', lc_cost: 0 },
      ];

      for (const strategy of strategies) {
        await db.prepare(
          'INSERT INTO trading_strategies (name, description, lc_cost) VALUES (?, ?, ?)'
        ).bind(strategy.name, strategy.description, strategy.lc_cost).run();
      }
    }
  } catch (error) {
    console.error('Error initializing strategies:', error);
  }
}

// LC Coins and User Profile routes  
app.get('/api/profile', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    let profile = await c.env.DB.prepare(
      'SELECT * FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first();

    // Create profile if it doesn't exist
    if (!profile) {
      await c.env.DB.prepare(
        'INSERT INTO user_profiles (user_id, lc_coins) VALUES (?, ?)'
      ).bind(user.id, 0).run(); // New users start with 0 LC coins

      profile = await c.env.DB.prepare(
        'SELECT * FROM user_profiles WHERE user_id = ?'
      ).bind(user.id).first();
    }

    return c.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.post('/api/profile/coins/add', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const { amount } = await c.req.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    await c.env.DB.prepare(
      'UPDATE user_profiles SET lc_coins = lc_coins + ?, total_earned_coins = total_earned_coins + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(amount, amount, user.id).run();

    const profile = await c.env.DB.prepare(
      'SELECT * FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first();

    return c.json(profile);
  } catch (error) {
    console.error('Add coins error:', error);
    return c.json({ error: 'Failed to add coins' }, 500);
  }
});

// Trading strategies routes
app.get('/api/strategies', createAuthMiddleware(), async (c) => {
  try {
    await initializeStrategies(c.env.DB);
    
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM trading_strategies WHERE is_active = 1 ORDER BY lc_cost ASC'
    ).all();

    return c.json(results);
  } catch (error) {
    console.error('Strategies error:', error);
    return c.json({ error: 'Failed to fetch strategies' }, 500);
  }
});

app.get('/api/bot/status', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    const profile = await c.env.DB.prepare(
      'SELECT bot_active FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first() as any;

    const activeConfigs = await c.env.DB.prepare(
      'SELECT ub.*, ts.name as strategy_name FROM user_bot_configs ub JOIN trading_strategies ts ON ub.strategy_id = ts.id WHERE ub.user_id = ? AND ub.is_active = 1'
    ).bind(user.id).all();

    return c.json({
      botActive: profile?.bot_active || false,
      activeStrategies: activeConfigs.results || []
    });
  } catch (error) {
    console.error('Bot status error:', error);
    return c.json({ error: 'Failed to fetch bot status' }, 500);
  }
});

app.post('/api/bot/toggle', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const { activate } = await c.req.json();

    // Get user profile with balance and credentials
    const profile = await c.env.DB.prepare(
      'SELECT luna_api_key, luna_api_secret, luno_balance_zar FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first() as any;

    const subscription = await c.env.DB.prepare(
      'SELECT * FROM user_subscriptions WHERE user_id = ? AND is_active = 1'
    ).bind(user.id).first() as any;

    if (activate) {
      // Check all requirements for activation
      if (!subscription) {
        return c.json({ error: 'Active subscription required to activate bot' }, 400);
      }

      if (!profile.luna_api_key || !profile.luna_api_secret) {
        return c.json({ error: 'Luna API credentials required to activate bot' }, 400);
      }

      const minBalanceZAR = 100; // R100 minimum in ZAR
      const zarBalance = profile.luno_balance_zar || 0;
      
      if (zarBalance < minBalanceZAR) {
        if (zarBalance === 0) {
          return c.json({ error: 'No ZAR balance available for trading. Please fund your Luno account with at least R100 ZAR to start trading.' }, 400);
        } else {
          return c.json({ error: `Insufficient ZAR balance. Minimum R${minBalanceZAR} required for trading (current: R${zarBalance.toFixed(2)}).` }, 400);
        }
      }
    }

    await c.env.DB.prepare(
      'UPDATE user_profiles SET bot_active = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(activate ? 1 : 0, user.id).run();

    return c.json({ success: true, botActive: activate });
  } catch (error) {
    console.error('Bot toggle error:', error);
    return c.json({ error: 'Failed to toggle bot' }, 500);
  }
});

app.post('/api/bot/activate-strategy', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const { strategyId, config } = await c.req.json();

    // Check if user has active subscription
    const subscription = await c.env.DB.prepare(
      'SELECT * FROM user_subscriptions WHERE user_id = ? AND is_active = 1'
    ).bind(user.id).first() as any;

    if (!subscription) {
      return c.json({ error: 'Active subscription required to activate strategies' }, 400);
    }

    // Create or update bot config
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO user_bot_configs (user_id, strategy_id, is_active, config_data) VALUES (?, ?, 1, ?)'
    ).bind(user.id, strategyId, JSON.stringify(config || {})).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Activate strategy error:', error);
    return c.json({ error: 'Failed to activate strategy' }, 500);
  }
});

// Luna API credentials management
app.post('/api/profile/luna-credentials', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const { apiKey, apiSecret } = await c.req.json();

    if (!apiKey || !apiSecret) {
      return c.json({ error: 'API key and secret are required' }, 400);
    }

    await c.env.DB.prepare(
      'UPDATE user_profiles SET luna_api_key = ?, luna_api_secret = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(apiKey, apiSecret, user.id).run();

    const profile = await c.env.DB.prepare(
      'SELECT * FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first();

    return c.json(profile);
  } catch (error) {
    console.error('Luna credentials error:', error);
    return c.json({ error: 'Failed to update Luna credentials' }, 500);
  }
});

app.post('/api/profile/luna-credentials/reset', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;

    // Clear the Luna API credentials and reset balances (only BTC, ETH, HBAR)
    await c.env.DB.prepare(
      'UPDATE user_profiles SET luna_api_key = NULL, luna_api_secret = NULL, luno_balance_btc = 0, luno_balance_eth = 0, luno_balance_hbar = 0, luno_last_sync = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(user.id).run();

    const profile = await c.env.DB.prepare(
      'SELECT * FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first();

    return c.json(profile);
  } catch (error) {
    console.error('Reset Luna credentials error:', error);
    return c.json({ error: 'Failed to reset Luna credentials' }, 500);
  }
});

// Luno API integration for real balance - NO FALLBACK DATA
app.get('/api/luno/balance', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    const profile = await c.env.DB.prepare(
      'SELECT luna_api_key, luna_api_secret FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first() as any;

    if (!profile?.luna_api_key || !profile?.luna_api_secret) {
      return c.json({ 
        error: 'Luno API credentials not configured', 
        errorCode: 'MISSING_CREDENTIALS',
        success: false 
      }, 400);
    }

    // Validate credentials format
    if (profile.luna_api_key.trim() === '' || profile.luna_api_secret.trim() === '') {
      return c.json({ 
        error: 'Luno API credentials are empty or invalid', 
        errorCode: 'INVALID_CREDENTIALS_FORMAT',
        success: false 
      }, 400);
    }

    try {
      console.log('DEBUG: Making REAL API call to Luno');
      console.log('DEBUG: API Key length:', profile.luna_api_key.length);
      console.log('DEBUG: API Secret length:', profile.luna_api_secret.length);
      console.log('DEBUG: API Key prefix:', profile.luna_api_key.substring(0, 8));

      // Use built-in btoa directly for HTTP Basic Auth - this is the standard approach
      const authString = `${profile.luna_api_key}:${profile.luna_api_secret}`;
      const base64Credentials = btoa(authString);
      
      console.log('DEBUG: Auth string length:', authString.length);
      console.log('DEBUG: Base64 auth length:', base64Credentials.length);
      console.log('DEBUG: Base64 auth prefix:', base64Credentials.substring(0, 20));
      
      // Make API call with exact Luno API specifications
      const lunoResponse = await fetch('https://api.luno.com/api/1/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'Accept': 'application/json',
          'User-Agent': 'CryptoMind-Bot/1.0'
        },
        signal: AbortSignal.timeout(20000) // 20 second timeout
      });

      console.log('DEBUG: Luno API Response Status:', lunoResponse.status);
      console.log('DEBUG: Luno API Response Headers:', JSON.stringify(Object.fromEntries(lunoResponse.headers.entries()), null, 2));

      // Handle non-OK responses with detailed error reporting
      if (!lunoResponse.ok) {
        const errorText = await lunoResponse.text();
        console.error('ERROR: Luno API Error Response:', errorText);
        
        let errorData: any = null;
        let errorMessage = `HTTP ${lunoResponse.status} Error`;
        let errorCode = `HTTP_${lunoResponse.status}`;
        
        try {
          errorData = JSON.parse(errorText);
          console.error('ERROR: Parsed Luno API Error Data:', JSON.stringify(errorData, null, 2));
        } catch (parseError) {
          console.error('ERROR: Failed to parse Luno error response as JSON:', parseError);
          errorData = { raw_error: errorText };
        }
        
        // Provide specific error messages and codes based on status
        switch (lunoResponse.status) {
          case 401:
            errorMessage = 'Authentication failed: Invalid API key or secret. Please check your Luno credentials.';
            errorCode = 'AUTHENTICATION_FAILED';
            break;
          case 403:
            errorMessage = 'Access forbidden: API key lacks required permissions. Ensure "Perm_R_Balance" is enabled.';
            errorCode = 'INSUFFICIENT_PERMISSIONS';
            break;
          case 429:
            errorMessage = 'Rate limit exceeded: Too many requests. Please wait before trying again.';
            errorCode = 'RATE_LIMITED';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = `Luno server error (${lunoResponse.status}): Service temporarily unavailable.`;
            errorCode = 'SERVER_ERROR';
            break;
          default:
            errorMessage = errorData?.error || errorData?.error_code || `Luno API returned ${lunoResponse.status} error`;
            errorCode = errorData?.error_code || `HTTP_${lunoResponse.status}`;
        }
        
        return c.json({ 
          error: errorMessage,
          errorCode: errorCode,
          httpStatus: lunoResponse.status,
          success: false,
          apiResponse: errorData,
          timestamp: new Date().toISOString()
        }, 400);
      }

      // Parse successful response
      const lunoApiData = await lunoResponse.json() as any;
      console.log('SUCCESS: Luno API Response Data:', JSON.stringify(lunoApiData, null, 2));

      // Validate response structure
      if (!lunoApiData || typeof lunoApiData !== 'object') {
        return c.json({ 
          error: 'Invalid response format: Expected JSON object from Luno API',
          errorCode: 'INVALID_RESPONSE_FORMAT',
          success: false,
          apiResponse: lunoApiData
        }, 500);
      }

      if (!lunoApiData.balance || !Array.isArray(lunoApiData.balance)) {
        return c.json({ 
          error: 'Invalid response structure: Missing or invalid balance array',
          errorCode: 'MISSING_BALANCE_DATA',
          success: false,
          apiResponse: lunoApiData
        }, 500);
      }

      console.log('DEBUG: Processing balance array with', lunoApiData.balance.length, 'assets');

      // Process balance data with explicit error checking
      let btcBalance: number | null = null;
      let ethBalance: number | null = null; 
      let hbarBalance: number | null = null;
      let zarBalance: number | null = null;
      
      const processedAssets: string[] = [];

      for (const assetBalance of lunoApiData.balance) {
        console.log('DEBUG: Processing asset:', JSON.stringify(assetBalance, null, 2));
        
        if (!assetBalance || typeof assetBalance !== 'object') {
          console.warn('WARN: Invalid asset balance object:', assetBalance);
          continue;
        }

        if (!assetBalance.asset || typeof assetBalance.asset !== 'string') {
          console.warn('WARN: Missing or invalid asset name:', assetBalance);
          continue;
        }

        const available = parseFloat(assetBalance.available) || 0;
        const reserved = parseFloat(assetBalance.reserved) || 0;
        const totalBalance = available + reserved;
        
        console.log(`DEBUG: Asset ${assetBalance.asset}: Available=${available}, Reserved=${reserved}, Total=${totalBalance}`);
        
        processedAssets.push(assetBalance.asset);

        // Map Luno asset codes to our system
        switch (assetBalance.asset.toUpperCase()) {
          case 'XBT': // Luno uses XBT for Bitcoin
            btcBalance = totalBalance;
            console.log('SUCCESS: Set BTC balance to:', btcBalance);
            break;
          case 'ETH': // Ethereum
            ethBalance = totalBalance;
            console.log('SUCCESS: Set ETH balance to:', ethBalance);
            break;
          case 'HBAR': // Hedera Hashgraph
            hbarBalance = totalBalance;
            console.log('SUCCESS: Set HBAR balance to:', hbarBalance);
            break;
          case 'ZAR': // South African Rand
            zarBalance = totalBalance;
            console.log('SUCCESS: Set ZAR balance to:', zarBalance);
            break;
          default:
            console.log('DEBUG: Ignoring unsupported asset:', assetBalance.asset);
            break;
        }
      }

      console.log('DEBUG: Processed assets:', processedAssets);
      console.log('DEBUG: Final balances:', { 
        btc: btcBalance, 
        eth: ethBalance, 
        hbar: hbarBalance,
        zar: zarBalance
      });

      // If no supported assets found, that's not necessarily an error
      if (btcBalance === null && ethBalance === null && hbarBalance === null && zarBalance === null) {
        console.warn('WARN: No supported assets found in Luno account');
      }

      // Use 0 as default for null balances (when asset exists but balance is 0)
      const finalBtcBalance = btcBalance !== null ? btcBalance : 0;
      const finalEthBalance = ethBalance !== null ? ethBalance : 0;
      const finalHbarBalance = hbarBalance !== null ? hbarBalance : 0;
      const finalZarBalance = zarBalance !== null ? zarBalance : 0;

      // Store balance data in database
      const updateResult = await c.env.DB.prepare(
        'UPDATE user_profiles SET luno_balance_btc = ?, luno_balance_eth = ?, luno_balance_hbar = ?, luno_balance_zar = ?, luno_last_sync = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      ).bind(finalBtcBalance, finalEthBalance, finalHbarBalance, finalZarBalance, user.id).run();

      console.log('SUCCESS: Database update result:', updateResult);

      // Return response with all debugging info
      const responseData = {
        btc: finalBtcBalance,
        eth: finalEthBalance,
        hbar: finalHbarBalance,
        zar: finalZarBalance,
        lastSync: new Date().toISOString(),
        success: true,
        source: 'luno_api_live',
        processedAssets: processedAssets,
        totalAssets: lunoApiData.balance.length,
        rawApiResponse: lunoApiData
      };

      console.log('SUCCESS: Returning balance response:', JSON.stringify(responseData, null, 2));
      return c.json(responseData);

    } catch (apiError) {
      console.error('ERROR: Luno API call failed:', apiError);
      
      let errorMessage = 'Failed to connect to Luno API';
      let errorCode = 'CONNECTION_ERROR';
      
      if (apiError instanceof Error) {
        if (apiError.name === 'TimeoutError' || apiError.message.includes('timeout')) {
          errorMessage = 'Request to Luno API timed out. Please try again.';
          errorCode = 'API_TIMEOUT';
        } else if (apiError.message.includes('Failed to fetch') || apiError.message.includes('network')) {
          errorMessage = 'Network error connecting to Luno API. Check your internet connection.';
          errorCode = 'NETWORK_ERROR';
        } else if (apiError.message.includes('AbortError')) {
          errorMessage = 'Request to Luno API was aborted or timed out.';
          errorCode = 'REQUEST_ABORTED';
        } else {
          errorMessage = `API Connection Error: ${apiError.message}`;
          errorCode = 'CONNECTION_ERROR';
        }
      }
      
      return c.json({ 
        error: errorMessage,
        errorCode: errorCode,
        success: false,
        details: apiError instanceof Error ? apiError.message : String(apiError),
        timestamp: new Date().toISOString()
      }, 500);
    }

  } catch (generalError) {
    console.error('ERROR: General Luno balance error:', generalError);
    return c.json({ 
      error: 'Internal server error while processing Luno balance request',
      errorCode: 'INTERNAL_ERROR',
      success: false,
      details: generalError instanceof Error ? generalError.message : String(generalError),
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Telegram bot webhook for lottery winner notifications
app.post('/api/webhook/telegram/lottery-notify', async (c) => {
  try {
    const { user_email, message, payout } = await c.req.json();

    if (!user_email || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // This endpoint can be called by your Telegram bot to notify users
    // You can store notifications in the database or send them directly
    
    return c.json({ 
      success: true, 
      message: 'Notification logged',
      user_email,
      payout: payout || 0
    });
  } catch (error) {
    console.error('Telegram lottery notification error:', error);
    return c.json({ error: 'Failed to process notification' }, 500);
  }
});

// Telegram bot webhook for LC coin purchases
app.post('/api/webhook/telegram/purchase', async (c) => {
  try {
    const { user_id, amount_rand } = await c.req.json();

    if (!user_id || !amount_rand) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Convert Rand to LC coins (R3 = 1 LC)
    const lcCoins = Math.floor(amount_rand / 3); // R3 = 1 LC

    // Find user by their Google email or create a mapping
    // For now, we'll assume the user_id from telegram matches the email
    // In production, you'd need a proper user mapping system
    
    const profile = await c.env.DB.prepare(
      'SELECT * FROM user_profiles WHERE user_id = ?'
    ).bind(user_id).first();

    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Add LC coins to user account
    await c.env.DB.prepare(
      'UPDATE user_profiles SET lc_coins = lc_coins + ?, total_earned_coins = total_earned_coins + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(lcCoins, lcCoins, user_id).run();

    return c.json({ 
      success: true, 
      message: `Added ${lcCoins} LC coins to user account`,
      user_id,
      lc_coins_added: lcCoins
    });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return c.json({ error: 'Failed to process purchase' }, 500);
  }
});

// Subscription management routes
app.get('/api/subscription', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    const subscription = await c.env.DB.prepare(
      'SELECT * FROM user_subscriptions WHERE user_id = ?'
    ).bind(user.id).first();

    return c.json(subscription || null);
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return c.json({ error: 'Failed to fetch subscription' }, 500);
  }
});

app.get('/api/subscription/tiers', createAuthMiddleware(), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM subscription_tiers WHERE is_active = 1 ORDER BY daily_cost ASC'
    ).all();

    return c.json(results);
  } catch (error) {
    console.error('Subscription tiers error:', error);
    return c.json({ error: 'Failed to fetch subscription tiers' }, 500);
  }
});

app.post('/api/subscription/activate', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const { tierName } = await c.req.json();

    // Get tier details
    const tier = await c.env.DB.prepare(
      'SELECT * FROM subscription_tiers WHERE name = ? AND is_active = 1'
    ).bind(tierName).first() as any;

    if (!tier) {
      return c.json({ error: 'Invalid subscription tier' }, 400);
    }

    // Check if user has enough LC coins
    const profile = await c.env.DB.prepare(
      'SELECT lc_coins FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first() as any;

    if (!profile || (profile.lc_coins as number) < (tier.daily_cost as number)) {
      return c.json({ error: 'Insufficient LC coins for this subscription' }, 400);
    }

    // Deduct daily cost
    await c.env.DB.prepare(
      'UPDATE user_profiles SET lc_coins = lc_coins - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(tier.daily_cost, user.id).run();

    // Calculate expiry (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    // Create or update subscription
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO user_subscriptions (user_id, subscription_tier, daily_cost, last_charged_date, is_active, expires_at) VALUES (?, ?, ?, date("now"), 1, ?)'
    ).bind(user.id, tierName, tier.daily_cost, expiresAt.toISOString()).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Subscription activation error:', error);
    return c.json({ error: 'Failed to activate subscription' }, 500);
  }
});

// Trading performance endpoint
app.get('/api/trading/performance', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    // Get all completed trading sessions for the user
    const { results: sessions } = await c.env.DB.prepare(
      'SELECT profit_loss, trades_count, status FROM trading_sessions WHERE user_id = ? AND status = "completed"'
    ).bind(user.id).all();

    if (!sessions || sessions.length === 0) {
      return c.json({
        totalReturn: 0,
        totalTrades: 0,
        profitableTrades: 0,
        averageReturn: 0
      });
    }

    let totalReturn = 0;
    let totalTrades = 0;
    let profitableTrades = 0;

    for (const session of sessions as any[]) {
      const profitLoss = session.profit_loss || 0;
      const tradesCount = session.trades_count || 0;
      
      totalReturn += profitLoss;
      totalTrades += tradesCount;
      
      if (profitLoss > 0) {
        profitableTrades++;
      }
    }

    const averageReturn = sessions.length > 0 ? totalReturn / sessions.length : 0;

    return c.json({
      totalReturn,
      totalTrades,
      profitableTrades,
      averageReturn
    });
  } catch (error) {
    console.error('Trading performance error:', error);
    return c.json({ error: 'Failed to fetch trading performance' }, 500);
  }
});

// Market preferences management
app.get('/api/markets/preferences', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    // Get user's market preferences, or default ones if none exist
    let { results } = await c.env.DB.prepare(
      'SELECT symbol, is_selected as isSelected, display_order as displayOrder FROM user_market_preferences WHERE user_id = ? ORDER BY display_order ASC'
    ).bind(user.id).all();

    // If no preferences exist, copy from defaults
    if (!results || results.length === 0) {
      const { results: defaults } = await c.env.DB.prepare(
        'SELECT symbol, is_selected, display_order FROM user_market_preferences WHERE user_id = "default" ORDER BY display_order ASC'
      ).all();

      for (const defaultPref of defaults as any[]) {
        await c.env.DB.prepare(
          'INSERT INTO user_market_preferences (user_id, symbol, is_selected, display_order) VALUES (?, ?, ?, ?)'
        ).bind(user.id, defaultPref.symbol, defaultPref.is_selected, defaultPref.display_order).run();
      }

      // Fetch the newly created preferences
      const { results: newResults } = await c.env.DB.prepare(
        'SELECT symbol, is_selected as isSelected, display_order as displayOrder FROM user_market_preferences WHERE user_id = ? ORDER BY display_order ASC'
      ).bind(user.id).all();
      
      results = newResults;
    }

    return c.json(results || []);
  } catch (error) {
    console.error('Market preferences fetch error:', error);
    return c.json({ error: 'Failed to fetch market preferences' }, 500);
  }
});

app.post('/api/markets/preferences', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const { markets } = await c.req.json();

    // Update each market preference
    for (const market of markets) {
      await c.env.DB.prepare(
        'INSERT OR REPLACE INTO user_market_preferences (user_id, symbol, is_selected, display_order) VALUES (?, ?, ?, ?)'
      ).bind(user.id, market.symbol, market.isSelected ? 1 : 0, market.displayOrder).run();
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Market preferences save error:', error);
    return c.json({ error: 'Failed to save market preferences' }, 500);
  }
});

// Market data with real-time prices - NO FALLBACK DATA
app.get('/api/markets/data', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    // Get user's selected markets
    const { results: preferences } = await c.env.DB.prepare(
      'SELECT symbol FROM user_market_preferences WHERE user_id = ? AND is_selected = 1 ORDER BY display_order ASC'
    ).bind(user.id).all();

    if (!preferences || preferences.length === 0) {
      return c.json([]);
    }

    const selectedSymbols = (preferences as any[]).map(p => p.symbol);
    
    // Get user's Luno balances (only crypto)
    const profile = await c.env.DB.prepare(
      'SELECT luno_balance_btc, luno_balance_eth, luno_balance_hbar FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first() as any;

    // Map symbols to CoinGecko IDs and filter out unsupported ones
    const symbolToCoinGeckoId: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum', 
      'XRP': 'ripple',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'SOL': 'solana',
      'MATIC': 'matic-network',
      'LINK': 'chainlink',
      'HBAR': 'hedera-hashgraph'
    };

    const validSymbols = selectedSymbols.filter(symbol => symbolToCoinGeckoId[symbol]);
    const invalidSymbols = selectedSymbols.filter(symbol => !symbolToCoinGeckoId[symbol]);
    
    const apiErrors: string[] = [];
    if (invalidSymbols.length > 0) {
      apiErrors.push(`Unsupported symbols: ${invalidSymbols.join(', ')}`);
    }

    if (validSymbols.length === 0) {
      return c.json({ 
        error: 'No supported cryptocurrencies selected',
        errorCode: 'NO_SUPPORTED_SYMBOLS',
        details: apiErrors,
        success: false,
        timestamp: new Date().toISOString()
      }, 400);
    }

    // Batch all coin IDs into a single API call to avoid rate limiting
    const coinGeckoIds = validSymbols.map(symbol => symbolToCoinGeckoId[symbol]);
    const batchedIds = coinGeckoIds.join(',');

    console.log(`DEBUG: Fetching batched market data for ${validSymbols.length} symbols: ${validSymbols.join(', ')}`);
    console.log(`DEBUG: CoinGecko IDs: ${batchedIds}`);

    try {
      const apiResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${batchedIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CryptoMind-Bot/1.0'
          },
          signal: AbortSignal.timeout(15000) // Longer timeout for batched request
        }
      );

      console.log(`DEBUG: CoinGecko batched API response: ${apiResponse.status}`);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`ERROR: CoinGecko batched API error:`, errorText);
        
        let errorMessage = 'Market data API error';
        let errorCode = `HTTP_${apiResponse.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (apiResponse.status === 429) {
            errorMessage = 'Rate limit exceeded: CoinGecko API requests are being throttled. Please wait a moment and try again.';
            errorCode = 'RATE_LIMITED';
          } else if (apiResponse.status >= 500) {
            errorMessage = `CoinGecko server error (${apiResponse.status}): Service temporarily unavailable.`;
            errorCode = 'SERVER_ERROR';
          } else {
            errorMessage = errorData?.status?.error_message || `CoinGecko API returned ${apiResponse.status} error`;
            errorCode = errorData?.status?.error_code?.toString() || errorCode;
          }
        } catch (parseError) {
          console.error('ERROR: Failed to parse CoinGecko error response:', parseError);
        }
        
        return c.json({ 
          error: errorMessage,
          errorCode: errorCode,
          httpStatus: apiResponse.status,
          success: false,
          details: apiErrors.length > 0 ? apiErrors : [`Failed to fetch market data: ${errorMessage}`],
          timestamp: new Date().toISOString()
        }, apiResponse.status === 429 ? 429 : 500);
      }

      const responseData = await apiResponse.json() as any;
      console.log(`DEBUG: CoinGecko batched response data:`, JSON.stringify(responseData, null, 2));

      if (!responseData || typeof responseData !== 'object') {
        return c.json({ 
          error: 'Invalid response format from CoinGecko API',
          errorCode: 'INVALID_RESPONSE_FORMAT',
          success: false,
          details: ['Expected JSON object from market data API'],
          timestamp: new Date().toISOString()
        }, 500);
      }

      const marketData = [];
      const dataErrors: string[] = [];

      // Process each symbol
      for (const symbol of validSymbols) {
        const coinGeckoId = symbolToCoinGeckoId[symbol];
        const coinData = responseData[coinGeckoId];

        if (!coinData) {
          dataErrors.push(`No market data available for ${symbol}`);
          continue;
        }

        // Validate required data fields
        if (typeof coinData.usd !== 'number') {
          dataErrors.push(`Invalid price data for ${symbol}`);
          continue;
        }

        const priceData = {
          price: coinData.usd,
          change24h: coinData.usd_24h_change || 0,
          volume24h: coinData.usd_24h_vol || 0,
          marketCap: coinData.usd_market_cap || 0
        };

        // Get user's holdings for this symbol
        let holdings = 0;
        if (symbol === 'BTC') holdings = profile?.luno_balance_btc || 0;
        else if (symbol === 'ETH') holdings = profile?.luno_balance_eth || 0;
        else if (symbol === 'HBAR') holdings = profile?.luno_balance_hbar || 0;

        const holdingsValue = holdings * priceData.price;

        marketData.push({
          symbol,
          name: getCoinName(symbol),
          price: priceData.price,
          change24h: priceData.change24h,
          volume24h: priceData.volume24h,
          marketCap: priceData.marketCap,
          holdings,
          holdingsValue
        });

        console.log(`SUCCESS: Processed market data for ${symbol}`);
      }

      // Combine all errors
      const allErrors = [...apiErrors, ...dataErrors];

      // If we have no market data but have errors, return error
      if (marketData.length === 0 && allErrors.length > 0) {
        return c.json({ 
          error: 'Failed to process market data for all selected cryptocurrencies',
          errorCode: 'MARKET_DATA_PROCESSING_FAILED',
          details: allErrors,
          success: false,
          timestamp: new Date().toISOString()
        }, 500);
      }

      // Return successful data with any warnings
      const responsePayload: any = {
        data: marketData,
        success: true,
        timestamp: new Date().toISOString(),
        source: 'coingecko_batched'
      };

      if (allErrors.length > 0) {
        responsePayload.warnings = allErrors;
        responsePayload.partialSuccess = true;
      }

      console.log(`SUCCESS: Returning batched market data for ${marketData.length} symbols with ${allErrors.length} warnings`);
      return c.json(responsePayload);

    } catch (apiError) {
      console.error('ERROR: CoinGecko batched API call failed:', apiError);
      
      let errorMessage = 'Failed to connect to market data API';
      let errorCode = 'CONNECTION_ERROR';
      
      if (apiError instanceof Error) {
        if (apiError.name === 'TimeoutError' || apiError.message.includes('timeout')) {
          errorMessage = 'Market data request timed out. Please try again.';
          errorCode = 'API_TIMEOUT';
        } else if (apiError.message.includes('Failed to fetch') || apiError.message.includes('network')) {
          errorMessage = 'Network error connecting to market data API. Check your internet connection.';
          errorCode = 'NETWORK_ERROR';
        } else if (apiError.message.includes('AbortError')) {
          errorMessage = 'Market data request was aborted or timed out.';
          errorCode = 'REQUEST_ABORTED';
        } else {
          errorMessage = `Market data API connection error: ${apiError.message}`;
          errorCode = 'CONNECTION_ERROR';
        }
      }
      
      return c.json({ 
        error: errorMessage,
        errorCode: errorCode,
        success: false,
        details: apiError instanceof Error ? [apiError.message] : [String(apiError)],
        timestamp: new Date().toISOString()
      }, 500);
    }

  } catch (error) {
    console.error('ERROR: Market data general error:', error);
    return c.json({ 
      error: 'Internal error while fetching market data',
      errorCode: 'INTERNAL_ERROR',
      success: false,
      details: error instanceof Error ? [error.message] : [String(error)],
      timestamp: new Date().toISOString()
    }, 500);
  }
});

function getCoinName(symbol: string): string {
  const names: { [key: string]: string } = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'Ripple',
    'LTC': 'Litecoin',
    'BCH': 'Bitcoin Cash',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'SOL': 'Solana',
    'MATIC': 'Polygon',
    'LINK': 'Chainlink',
    'HBAR': 'Hedera',
  };
  return names[symbol] || symbol;
}

// Lottery System Routes
app.get('/api/lottery/pools', createAuthMiddleware(), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM lottery_pools ORDER BY pool_type'
    ).all();

    return c.json(results);
  } catch (error) {
    console.error('Lottery pools error:', error);
    return c.json({ error: 'Failed to fetch lottery pools' }, 500);
  }
});

app.get('/api/lottery/tickets', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM lottery_tickets WHERE user_id = ? ORDER BY purchase_date DESC'
    ).bind(user.id).all();

    return c.json(results);
  } catch (error) {
    console.error('Lottery tickets error:', error);
    return c.json({ error: 'Failed to fetch lottery tickets' }, 500);
  }
});

app.get('/api/lottery/draws/recent', createAuthMiddleware(), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM lottery_draws WHERE status = "paid_out" ORDER BY draw_date DESC LIMIT 10'
    ).all();

    return c.json(results);
  } catch (error) {
    console.error('Lottery draws error:', error);
    return c.json({ error: 'Failed to fetch lottery draws' }, 500);
  }
});

app.post('/api/lottery/purchase', createAuthMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const { draw_type, numbers, cost } = await c.req.json();

    // Validate inputs
    if (!['weekly', 'monthly'].includes(draw_type)) {
      return c.json({ error: 'Invalid draw type' }, 400);
    }

    const numbersArray = numbers.split(',').map((n: string) => parseInt(n.trim()));
    
    // Validate number count and range
    if (draw_type === 'weekly') {
      if (numbersArray.length !== 3 || numbersArray.some((n: number) => n < 1 || n > 30)) {
        return c.json({ error: 'Weekly draw requires exactly 3 numbers between 1-30' }, 400);
      }
      if (cost !== 5) {
        return c.json({ error: 'Weekly ticket costs 5 LC coins' }, 400);
      }
    } else {
      if (numbersArray.length !== 5 || numbersArray.some((n: number) => n < 1 || n > 50)) {
        return c.json({ error: 'Monthly draw requires exactly 5 numbers between 1-50' }, 400);
      }
      if (cost !== 10) {
        return c.json({ error: 'Monthly ticket costs 10 LC coins' }, 400);
      }
    }

    // Check user has enough LC coins
    const profile = await c.env.DB.prepare(
      'SELECT lc_coins FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first() as any;

    if (!profile || profile.lc_coins < cost) {
      return c.json({ error: 'Insufficient LC coins' }, 400);
    }

    // Check for duplicate numbers
    if (new Set(numbersArray).size !== numbersArray.length) {
      return c.json({ error: 'Cannot select duplicate numbers' }, 400);
    }

    // Deduct LC coins
    await c.env.DB.prepare(
      'UPDATE user_profiles SET lc_coins = lc_coins - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(cost, user.id).run();

    // Create ticket
    await c.env.DB.prepare(
      'INSERT INTO lottery_tickets (user_id, draw_type, numbers, cost) VALUES (?, ?, ?, ?)'
    ).bind(user.id, draw_type, numbers, cost).run();

    // Update pool
    await c.env.DB.prepare(
      'UPDATE lottery_pools SET current_amount = current_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE pool_type = ?'
    ).bind(cost, draw_type).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Lottery purchase error:', error);
    return c.json({ error: 'Failed to purchase ticket' }, 500);
  }
});

// Admin endpoint to run weekly draw
app.post('/api/lottery/draw/weekly', async (c) => {
  try {
    await runLotteryDraw(c.env.DB, 'weekly', c.env);
    return c.json({ success: true });
  } catch (error) {
    console.error('Weekly draw error:', error);
    return c.json({ error: 'Failed to run weekly draw' }, 500);
  }
});

// Admin endpoint to run monthly draw
app.post('/api/lottery/draw/monthly', async (c) => {
  try {
    await runLotteryDraw(c.env.DB, 'monthly', c.env);
    return c.json({ success: true });
  } catch (error) {
    console.error('Monthly draw error:', error);
    return c.json({ error: 'Failed to run monthly draw' }, 500);
  }
});

// Helper function to run lottery draws
async function runLotteryDraw(db: D1Database, drawType: 'weekly' | 'monthly', env: any) {
  const isWeekly = drawType === 'weekly';
  const numberCount = isWeekly ? 3 : 5;
  const maxNumber = isWeekly ? 30 : 50;

  // Generate winning numbers
  const winningNumbers: number[] = [];
  while (winningNumbers.length < numberCount) {
    const num = Math.floor(Math.random() * maxNumber) + 1;
    if (!winningNumbers.includes(num)) {
      winningNumbers.push(num);
    }
  }
  winningNumbers.sort((a, b) => a - b);
  const winningNumbersStr = winningNumbers.join(',');

  // Get current pool
  const pool = await db.prepare(
    'SELECT * FROM lottery_pools WHERE pool_type = ?'
  ).bind(drawType).first() as any;

  if (!pool) {
    throw new Error(`${drawType} pool not found`);
  }

  const totalPool = pool.current_amount + pool.carryover_amount;

  // Get all tickets for this draw type that haven't been processed
  const { results: tickets } = await db.prepare(
    'SELECT * FROM lottery_tickets WHERE draw_type = ? AND draw_id IS NULL'
  ).bind(drawType).all();

  // Create draw record
  const drawResult = await db.prepare(
    'INSERT INTO lottery_draws (draw_type, draw_date, winning_numbers, total_pool, total_tickets) VALUES (?, date("now"), ?, ?, ?)'
  ).bind(drawType, winningNumbersStr, totalPool, tickets?.length || 0).run();

  const drawId = drawResult.meta.last_row_id;

  // Process tickets and find winners
  let fullMatchWinners = 0;
  let partialMatchTickets = 0;
  let refundAmount = 0;

  const notifications: Array<{user_id: string, message: string, payout: number}> = [];

  for (const ticket of (tickets as any[]) || []) {
    const ticketNumbers = ticket.numbers.split(',').map((n: string) => parseInt(n.trim()));
    const matches = ticketNumbers.filter((n: number) => winningNumbers.includes(n)).length;

    let status = 'lose';
    let payout = 0;

    if (matches === numberCount) {
      // Full match - winner
      status = 'win';
      fullMatchWinners++;
    } else if (isWeekly && matches === 2) {
      // Partial match (weekly only) - refund
      status = 'refund';
      payout = ticket.cost;
      refundAmount += payout;
      partialMatchTickets++;
    }

    // Update ticket
    await db.prepare(
      'UPDATE lottery_tickets SET draw_id = ?, matches = ?, payout = ?, status = ? WHERE id = ?'
    ).bind(drawId, matches, payout, status, ticket.id).run();

    // Prepare notification if there's a payout
    if (payout > 0) {
      notifications.push({
        user_id: ticket.user_id,
        message: status === 'refund' ? 
          `🎫 Lottery Refund: You matched 2 numbers in the weekly draw and received ${payout} LC coins back!` :
          `🏆 Lottery Winner: You won ${payout} LC coins in the ${drawType} draw!`,
        payout
      });
    }
  }

  // Calculate payouts
  let ownerProfit = 0;
  let monthlyContribution = 0;
  let carryoverAmount = 0;
  let payoutPerWinner = 0;

  const poolAfterRefunds = totalPool - refundAmount;

  if (fullMatchWinners > 0) {
    if (isWeekly) {
      // Weekly: 60% to winners, 30% to monthly, 10% profit
      const winnerShare = poolAfterRefunds * 0.6;
      monthlyContribution = poolAfterRefunds * 0.3;
      ownerProfit = poolAfterRefunds * 0.1;
      payoutPerWinner = winnerShare / fullMatchWinners;
    } else {
      // Monthly: 80% to winners, 12% profit, 8% carryover
      const winnerShare = poolAfterRefunds * 0.8;
      ownerProfit = poolAfterRefunds * 0.12;
      carryoverAmount = poolAfterRefunds * 0.08;
      payoutPerWinner = winnerShare / fullMatchWinners;
    }

    // Update winner tickets with actual payout
    await db.prepare(
      'UPDATE lottery_tickets SET payout = ? WHERE draw_id = ? AND status = "win"'
    ).bind(payoutPerWinner, drawId).run();

    // Add winning notifications
    const winnerTickets = await db.prepare(
      'SELECT user_id FROM lottery_tickets WHERE draw_id = ? AND status = "win"'
    ).bind(drawId).all();

    for (const winner of (winnerTickets.results as any[]) || []) {
      notifications.push({
        user_id: winner.user_id,
        message: `🏆 JACKPOT WINNER! You won ${payoutPerWinner.toFixed(2)} LC coins in the ${drawType} lottery! Numbers: ${winningNumbersStr}`,
        payout: payoutPerWinner
      });
    }
  } else {
    // No winners - carryover everything except owner profit
    if (isWeekly) {
      monthlyContribution = poolAfterRefunds * 0.3;
      ownerProfit = poolAfterRefunds * 0.1;
      carryoverAmount = poolAfterRefunds * 0.6; // 60% carries over to next weekly
    } else {
      ownerProfit = poolAfterRefunds * 0.12;
      carryoverAmount = poolAfterRefunds * 0.88; // 88% carries over to next monthly
    }
  }

  // Update draw with final results
  await db.prepare(
    'UPDATE lottery_draws SET winners_count = ?, payout_per_winner = ?, carryover_amount = ?, profit_amount = ?, status = "paid_out" WHERE id = ?'
  ).bind(fullMatchWinners, payoutPerWinner, carryoverAmount, ownerProfit, drawId).run();

  // Process payouts - add LC coins to winners and refunds
  for (const notification of notifications) {
    if (notification.payout > 0) {
      await db.prepare(
        'UPDATE user_profiles SET lc_coins = lc_coins + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      ).bind(notification.payout, notification.user_id).run();
    }
  }

  // Update pools
  if (isWeekly) {
    // Reset weekly pool, add carryover
    await db.prepare(
      'UPDATE lottery_pools SET current_amount = 0, carryover_amount = ?, next_draw_date = date("now", "+7 days"), updated_at = CURRENT_TIMESTAMP WHERE pool_type = "weekly"'
    ).bind(carryoverAmount).run();

    // Add contribution to monthly pool
    if (monthlyContribution > 0) {
      await db.prepare(
        'UPDATE lottery_pools SET current_amount = current_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE pool_type = "monthly"'
      ).bind(monthlyContribution).run();
    }
  } else {
    // Reset monthly pool, add carryover
    await db.prepare(
      'UPDATE lottery_pools SET current_amount = 0, carryover_amount = ?, next_draw_date = date("now", "+30 days"), updated_at = CURRENT_TIMESTAMP WHERE pool_type = "monthly"'
    ).bind(carryoverAmount).run();
  }

  // Send notifications to Telegram bot
  try {
    for (const notification of notifications) {
      await sendTelegramNotification(env, notification.user_id, notification.message);
    }

    // Send summary to owner
    const summaryMessage = `
🎰 ${drawType.toUpperCase()} LOTTERY DRAW COMPLETE

🎯 Winning Numbers: ${winningNumbersStr}
💰 Total Pool: ${totalPool} LC
🎫 Total Tickets: ${tickets?.length || 0}
🏆 Full Winners: ${fullMatchWinners}
${isWeekly ? `🔄 Partial Matches: ${partialMatchTickets}` : ''}
💵 Payout per Winner: ${payoutPerWinner.toFixed(2)} LC
📈 Your Profit: ${ownerProfit.toFixed(2)} LC
${carryoverAmount > 0 ? `🔄 Carryover: ${carryoverAmount.toFixed(2)} LC` : ''}
`;

    await sendTelegramNotification(env, 'owner', summaryMessage);
  } catch (telegramError) {
    console.error('Failed to send Telegram notifications:', telegramError);
  }
}

// Helper function to send Telegram notifications
async function sendTelegramNotification(env: any, userId: string, message: string) {
  try {
    if (!env.TELEGRAM_BOT_TOKEN) {
      console.log('No Telegram bot token configured');
      return;
    }

    // This would integrate with your existing Telegram bot
    // For now, we'll just log the notification
    console.log(`Telegram notification for ${userId}: ${message}`);
    
    // In production, you would send this to your Telegram bot API
    // await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     chat_id: userId, // This would need to be mapped to Telegram chat IDs
    //     text: message
    //   })
    // });
  } catch (error) {
    console.error('Telegram notification error:', error);
  }
}

// Weekly Leaderboard endpoint
app.get('/api/leaderboard/weekly', createAuthMiddleware(), async (c) => {
  try {
    // Calculate start of current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all trading sessions from this week that are completed
    const { results: sessions } = await c.env.DB.prepare(`
      SELECT 
        ts.user_id,
        SUM(ts.profit_loss) as weekly_profit,
        COUNT(*) as weekly_trades
      FROM trading_sessions ts
      WHERE ts.status = 'completed' 
      AND ts.start_time >= ?
      GROUP BY ts.user_id
      HAVING weekly_profit > 0
      ORDER BY weekly_profit DESC
      LIMIT 10
    `).bind(startOfWeek.toISOString()).all();

    if (!sessions || sessions.length === 0) {
      return c.json([]);
    }

    // Get user details for each user in leaderboard
    const leaderboard = [];
    for (const session of sessions as any[]) {
      try {
        // Get user data from Mocha Users Service
        const userResponse = await fetch(`${c.env.MOCHA_USERS_SERVICE_API_URL}/api/v1/users/${session.user_id}`, {
          headers: {
            'Authorization': `Bearer ${c.env.MOCHA_USERS_SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        let userData: any = null;
        if (userResponse.ok) {
          userData = await userResponse.json();
        }

        leaderboard.push({
          user_id: session.user_id,
          username: userData?.google_user_data?.given_name || 'Anonymous',
          avatar: userData?.google_user_data?.picture || '',
          weekly_profit: session.weekly_profit,
          weekly_trades: session.weekly_trades
        });
      } catch (error) {
        console.error('Error fetching user data for leaderboard:', error);
        // Include user with anonymous data if we can't fetch their info
        leaderboard.push({
          user_id: session.user_id,
          username: 'Anonymous',
          avatar: '',
          weekly_profit: session.weekly_profit,
          weekly_trades: session.weekly_trades
        });
      }
    }

    return c.json(leaderboard);
  } catch (error) {
    console.error('Weekly leaderboard error:', error);
    return c.json({ error: 'Failed to fetch weekly leaderboard' }, 500);
  }
});

// Daily subscription charging (to be called by a cron job)
app.post('/api/subscription/charge-daily', async (c) => {
  try {
    // Get all active subscriptions that need charging
    const { results: activeSubscriptions } = await c.env.DB.prepare(`
      SELECT us.*, up.lc_coins 
      FROM user_subscriptions us 
      JOIN user_profiles up ON us.user_id = up.user_id 
      WHERE us.is_active = 1 
      AND (us.last_charged_date IS NULL OR us.last_charged_date < date('now'))
    `).all();

    let chargedCount = 0;
    let deactivatedCount = 0;

    for (const subscription of activeSubscriptions as any[]) {
      if (subscription.lc_coins >= subscription.daily_cost) {
        // Charge the user
        await c.env.DB.prepare(
          'UPDATE user_profiles SET lc_coins = lc_coins - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
        ).bind(subscription.daily_cost, subscription.user_id).run();

        // Update subscription
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 1);

        await c.env.DB.prepare(
          'UPDATE user_subscriptions SET last_charged_date = date("now"), expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
        ).bind(newExpiresAt.toISOString(), subscription.user_id).run();

        chargedCount++;
      } else {
        // Deactivate subscription due to insufficient funds
        await c.env.DB.prepare(
          'UPDATE user_subscriptions SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
        ).bind(subscription.user_id).run();

        deactivatedCount++;
      }
    }

    return c.json({ 
      success: true, 
      charged: chargedCount, 
      deactivated: deactivatedCount 
    });
  } catch (error) {
    console.error('Daily charging error:', error);
    return c.json({ error: 'Failed to process daily charges' }, 500);
  }
});

const worker = {
  fetch: app.fetch.bind(app),
};

export default worker;
