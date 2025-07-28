import { useAuth } from '@getmocha/users-service/react';
import { LogOut, Coins, Bot, BarChart3 } from 'lucide-react';
import { useProfile } from '@/react-app/hooks/useAPI';
import HeaderSettings from '@/react-app/components/HeaderSettings';

export default function ComplexHeader() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  if (!user) return null;

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-blue-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              CryptoMind Pro
            </h1>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1">
              <span className="text-xs font-medium text-blue-300">Complex Bot</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">
                  {profile?.lc_coins || 0} LC
                </span>
              </div>
              
              <div className="flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">
                  Pro Mode
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <HeaderSettings isComplex={true} />
              <img
                src={user.google_user_data.picture || ''}
                alt={user.google_user_data.name || 'User'}
                className="w-8 h-8 rounded-full border-2 border-blue-500/30"
              />
              <span className="text-sm text-gray-300">
                {user.google_user_data.given_name}
              </span>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
