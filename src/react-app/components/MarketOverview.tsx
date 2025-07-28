import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, Wallet } from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holdings: number;
  holdingsValue: number;
}

interface MarketOverviewProps {
  isComplex?: boolean;
}

export default function MarketOverview({ isComplex = false }: MarketOverviewProps) {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const themeColors = isComplex 
    ? {
        primary: 'blue-500',
        secondary: 'cyan-400',
        accent: 'blue-400',
        border: 'blue-500/20',
        bg: 'blue-500/10'
      }
    : {
        primary: 'purple-500',
        secondary: 'pink-400',
        accent: 'purple-400',
        border: 'purple-500/20',
        bg: 'purple-500/10'
      };

  const fetchMarketData = async () => {
    if (loading && markets.length > 0) return; // Don't show loading on refresh
    
    try {
      const response = await fetch('/api/markets/data');
      if (response.ok) {
        const responseData = await response.json();
        
        // Handle new response format
        if (responseData.success && responseData.data) {
          setMarkets(responseData.data);
          setLastUpdate(new Date());
          
          // Log any warnings for debugging
          if (responseData.warnings && responseData.warnings.length > 0) {
            console.warn('Market data warnings:', responseData.warnings);
          }
        } else {
          // Handle error response
          console.error('Market data error:', responseData.error);
          setMarkets([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Market data API error:', errorData);
        setMarkets([]);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatHoldings = (symbol: string, amount: number) => {
    if (amount < 0.0001) return `${amount.toFixed(8)} ${symbol}`;
    if (amount < 1) return `${amount.toFixed(6)} ${symbol}`;
    return `${amount.toFixed(4)} ${symbol}`;
  };

  const getLastUpdateText = () => {
    if (!lastUpdate) return 'Never updated';
    
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    return `${Math.floor(diffSeconds / 60)}m ago`;
  };

  if (loading && markets.length === 0) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-xl border border-${themeColors.border} rounded-xl p-6`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <BarChart3 className={`w-6 h-6 text-${themeColors.accent}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-xl border border-${themeColors.border} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <BarChart3 className={`w-5 h-5 text-${themeColors.accent}`} />
          <span>Market Overview</span>
        </h3>
        
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400">
            Updated: {getLastUpdateText()}
          </span>
          <button
            onClick={fetchMarketData}
            disabled={loading}
            className={`p-2 text-${themeColors.accent} hover:text-${themeColors.secondary} transition-colors disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {markets.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>No markets selected. Configure your market preferences above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {markets.map((market) => (
            <div key={market.symbol} className={`bg-${themeColors.bg} border border-${themeColors.primary}/20 rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-bold text-white">{market.symbol}</div>
                  <div className="text-xs text-gray-400">{market.name}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{formatPrice(market.price)}</div>
                  <div className={`text-xs flex items-center space-x-1 ${
                    market.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {market.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400 mb-1">24h Volume</div>
                  <div className="text-white font-medium">{formatVolume(market.volume24h)}</div>
                </div>
                
                <div>
                  <div className="text-gray-400 mb-1">Market Cap</div>
                  <div className="text-white font-medium">{formatVolume(market.marketCap)}</div>
                </div>
              </div>

              {market.holdings > 0 && (
                <div className={`mt-3 pt-3 border-t border-${themeColors.primary}/10`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wallet className={`w-3 h-3 text-${themeColors.secondary}`} />
                      <span className="text-xs text-gray-400">Your Holdings</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white font-medium">
                        {formatHoldings(market.symbol, market.holdings)}
                      </div>
                      <div className={`text-xs text-${themeColors.secondary}`}>
                        {formatPrice(market.holdingsValue)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
