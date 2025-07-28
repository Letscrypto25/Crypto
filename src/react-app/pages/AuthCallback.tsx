import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Fixed import
import { useAuth } from '@getmocha/users-service/react';
import { Bot } from 'lucide-react';

export default function AuthCallback({ onAuthCompleted }: { onAuthCompleted?: () => void }) {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Clear any existing auth state (mobile fix)
        localStorage.removeItem('authState');
        sessionStorage.removeItem('authState');

        await exchangeCodeForSessionToken();
        
        // Mobile-specific handling
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          if (onAuthCompleted) {
            onAuthCompleted(); // Use the forced redirect
          } else {
            window.location.href = '/'; // Full page reload fallback
          }
        } else {
          navigate('/'); // Regular navigation for desktop
        }
      } catch (error) {
        console.error('Auth callback failed:', error);
        // Ensure cleanup on error
        localStorage.removeItem('authState');
        navigate('/?error=auth_failed');
      }
    };

    // Add timeout to ensure all storage operations complete
    const timer = setTimeout(handleCallback, 100);
    return () => clearTimeout(timer);
  }, [exchangeCodeForSessionToken, navigate, onAuthCompleted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Bot className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In</h2>
        <p className="text-gray-400">Please wait while we set up your account...</p>
      </div>
    </div>
  );
}
