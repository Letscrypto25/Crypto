import { useState, useEffect } from 'react';
import { Settings, CheckSquare, Square, Move } from 'lucide-react';

interface Market {
  symbol: string;
  name: string;
  isSelected: boolean;
  displayOrder: number;
}

interface MarketSelectorProps {
  isComplex?: boolean;
}

export default function MarketSelector({ isComplex = false }: MarketSelectorProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const themeColors = isComplex 
    ? {
        primary: 'blue-500',
        secondary: 'cyan-400',
        accent: 'blue-400',
        border: 'blue-500/20'
      }
    : {
        primary: 'purple-500',
        secondary: 'pink-400',
        accent: 'purple-400',
        border: 'purple-500/20'
      };

  const availableMarkets = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'BCH', name: 'Bitcoin Cash' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'LINK', name: 'Chainlink' },
  ];

  const fetchMarketPreferences = async () => {
    try {
      const response = await fetch('/api/markets/preferences');
      if (response.ok) {
        const data = await response.json();
        setMarkets(data);
      }
    } catch (error) {
      console.error('Failed to fetch market preferences:', error);
    }
  };

  useEffect(() => {
    fetchMarketPreferences();
  }, []);

  const toggleMarket = (symbol: string) => {
    setMarkets(prev => 
      prev.map(market => 
        market.symbol === symbol 
          ? { ...market, isSelected: !market.isSelected }
          : market
      )
    );
  };

  const moveMarket = (symbol: string, direction: 'up' | 'down') => {
    setMarkets(prev => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const currentIndex = sorted.findIndex(m => m.symbol === symbol);
      
      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === sorted.length - 1)
      ) {
        return prev;
      }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const updated = [...sorted];
      [updated[currentIndex], updated[newIndex]] = [updated[newIndex], updated[currentIndex]];
      
      return updated.map((market, index) => ({
        ...market,
        displayOrder: index + 1
      }));
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/markets/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markets }),
      });
      
      if (response.ok) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to save market preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = markets.filter(m => m.isSelected).length;

  return (
    <div className={`bg-slate-800/50 backdrop-blur-xl border border-${themeColors.border} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Settings className={`w-5 h-5 text-${themeColors.accent}`} />
          <span>Market Selection</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs text-${themeColors.secondary} bg-${themeColors.primary}/10 px-2 py-1 rounded-full`}>
            {selectedCount} markets
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1 text-xs bg-${themeColors.primary}/20 hover:bg-${themeColors.primary}/30 text-${themeColors.secondary} border border-${themeColors.primary}/30 rounded-lg transition-colors`}
          >
            {isOpen ? 'Close' : 'Configure'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div className={`text-xs text-gray-400 mb-3 p-3 bg-${themeColors.primary}/5 border border-${themeColors.primary}/10 rounded-lg`}>
            Select which cryptocurrency markets to display in your dashboard. You can reorder them using the move buttons.
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {markets
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((market) => {
                const marketInfo = availableMarkets.find(m => m.symbol === market.symbol);
                return (
                  <div key={market.symbol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleMarket(market.symbol)}
                        className={`text-${market.isSelected ? themeColors.secondary : 'gray-500'} hover:text-${themeColors.accent} transition-colors`}
                      >
                        {market.isSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-white">{market.symbol}</div>
                        <div className="text-xs text-gray-400">{marketInfo?.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveMarket(market.symbol, 'up')}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        disabled={markets.findIndex(m => m.symbol === market.symbol) === 0}
                      >
                        <Move className="w-3 h-3 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveMarket(market.symbol, 'down')}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        disabled={markets.findIndex(m => m.symbol === market.symbol) === markets.length - 1}
                      >
                        <Move className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700/50">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              disabled={saving}
              className={`px-4 py-2 text-sm bg-gradient-to-r from-${themeColors.primary} to-${themeColors.secondary} hover:opacity-90 text-white rounded-lg transition-all duration-200 disabled:opacity-50`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
