import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Bot, Zap, Globe, Moon, Sun, Bell, Smartphone } from 'lucide-react';

interface HeaderSettingsProps {
  isComplex?: boolean;
}

export default function HeaderSettings({ isComplex = false }: HeaderSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [botType, setBotType] = useState<'simple' | 'complex'>('simple');
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [performance, setPerformance] = useState<'high' | 'balanced' | 'battery'>('balanced');
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedBotType = localStorage.getItem('cryptoMindBotVersion') as 'simple' | 'complex';
    if (savedBotType) {
      setBotType(savedBotType);
    }

    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'auto';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications !== null) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedAutoSync = localStorage.getItem('autoSync');
    if (savedAutoSync !== null) {
      setAutoSync(JSON.parse(savedAutoSync));
    }

    const savedPerformance = localStorage.getItem('performance') as 'high' | 'balanced' | 'battery';
    if (savedPerformance) {
      setPerformance(savedPerformance);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // Check if click was on the dropdown itself
        const dropdown = document.getElementById('settings-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      // Calculate position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonPosition({
          x: rect.right - 240, // 240px is the width of the dropdown
          y: rect.bottom + 8
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleBotTypeChange = (newType: 'simple' | 'complex') => {
    setBotType(newType);
    localStorage.setItem('cryptoMindBotVersion', newType);
    setIsOpen(false);
    
    // Redirect to the appropriate dashboard
    window.location.href = `/dashboard/${newType}`;
  };

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('notifications', JSON.stringify(enabled));
  };

  const handleAutoSyncChange = (enabled: boolean) => {
    setAutoSync(enabled);
    localStorage.setItem('autoSync', JSON.stringify(enabled));
  };

  const handlePerformanceChange = (mode: 'high' | 'balanced' | 'battery') => {
    setPerformance(mode);
    localStorage.setItem('performance', mode);
  };

  const colorScheme = isComplex ? 'blue' : 'purple';

  const dropdown = isOpen ? (
    <div
      id="settings-dropdown"
      className={`fixed w-60 bg-slate-900/95 backdrop-blur-xl border rounded-xl shadow-2xl ${
        isComplex ? 'border-blue-500/30' : 'border-purple-500/30'
      }`}
      style={{
        left: `${buttonPosition.x}px`,
        top: `${buttonPosition.y}px`,
        zIndex: 2147483647 // Maximum z-index value
      }}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>App Settings</span>
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Bot Type Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Bot Interface Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleBotTypeChange('simple')}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                botType === 'simple'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-purple-500/40 text-gray-300'
              }`}
            >
              <Bot className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              <span className="text-xs font-medium">Simple</span>
            </button>

            <button
              onClick={() => handleBotTypeChange('complex')}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                botType === 'complex'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-blue-500/40 text-gray-300'
              }`}
            >
              <Zap className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <span className="text-xs font-medium">Complex</span>
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                theme === 'dark'
                  ? `border-${colorScheme}-500 bg-${colorScheme}-500/20`
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-gray-500'
              }`}
            >
              <Moon className="w-3 h-3 mx-auto mb-1 text-gray-300" />
              <span className="text-xs text-white">Dark</span>
            </button>

            <button
              onClick={() => handleThemeChange('light')}
              className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                theme === 'light'
                  ? `border-${colorScheme}-500 bg-${colorScheme}-500/20`
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-gray-500'
              }`}
            >
              <Sun className="w-3 h-3 mx-auto mb-1 text-yellow-400" />
              <span className="text-xs text-white">Light</span>
            </button>

            <button
              onClick={() => handleThemeChange('auto')}
              className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                theme === 'auto'
                  ? `border-${colorScheme}-500 bg-${colorScheme}-500/20`
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-gray-500'
              }`}
            >
              <Globe className="w-3 h-3 mx-auto mb-1 text-blue-400" />
              <span className="text-xs text-white">Auto</span>
            </button>
          </div>
        </div>

        {/* Performance Mode */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Performance Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handlePerformanceChange('battery')}
              className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                performance === 'battery'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-gray-500'
              }`}
            >
              <span className="text-xs text-white block">Battery</span>
              <span className="text-xs text-gray-400">Saver</span>
            </button>

            <button
              onClick={() => handlePerformanceChange('balanced')}
              className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                performance === 'balanced'
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-gray-500'
              }`}
            >
              <span className="text-xs text-white block">Balanced</span>
              <span className="text-xs text-gray-400">Default</span>
            </button>

            <button
              onClick={() => handlePerformanceChange('high')}
              className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                performance === 'high'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-gray-600/50 bg-slate-700/30 hover:border-gray-500'
              }`}
            >
              <span className="text-xs text-white block">High</span>
              <span className="text-xs text-gray-400">Performance</span>
            </button>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-3 pt-2 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Notifications</span>
            </div>
            <button
              onClick={() => handleNotificationsChange(!notifications)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                notifications ? `bg-${colorScheme}-600` : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                  notifications ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Auto-sync</span>
            </div>
            <button
              onClick={() => handleAutoSyncChange(!autoSync)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                autoSync ? `bg-${colorScheme}-600` : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                  autoSync ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="pt-3 border-t border-gray-700/50">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>CryptoMind Trading Bot</span>
              <span className="text-cyan-400">v2.1</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Current Mode:</span>
              <span className={`${isComplex ? 'text-blue-400' : 'text-purple-400'} capitalize font-medium`}>
                {botType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Build:</span>
              <span className="text-gray-400">2024.07.23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isComplex 
            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' 
            : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
        } ${isOpen ? 'bg-slate-700/50' : ''}`}
      >
        <Settings className="w-5 h-5" />
      </button>

      {typeof window !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
