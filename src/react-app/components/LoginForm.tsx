import { useAuth } from '@getmocha/users-service/react';
import { Chrome, Bot } from 'lucide-react';

export default function LoginForm() {
  const { redirectToLogin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bot className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            CryptoMind
          </h1>
          <p className="text-gray-400">
            AI-powered crypto trading bot with advanced strategies
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-300 mb-2">Features</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Multiple trading strategies</li>
              <li>• LC coin-based activation system</li>
              <li>• Real-time trading analytics</li>
              <li>• Advanced risk management</li>
            </ul>
          </div>
          
          <button
            onClick={redirectToLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/25"
          >
            <Chrome className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
