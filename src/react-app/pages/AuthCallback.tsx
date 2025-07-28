import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@getmocha/users-service/react';
import { Bot } from 'lucide-react';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isChrome = /Chrome|CriOS/i.test(navigator.userAgent);
    let authCompleted = false;

    const completeAuth = async () => {
      if (authCompleted) return;
      authCompleted = true;

      try {
        // 1. Clear all possible auth states
        localStorage.removeItem('authState');
        sessionStorage.removeItem('authState');
        document.cookie = 'authToken=; Max-Age=0; path=/;';

        // 2. Add delay for Chrome mobile to process storage changes
        await new Promise(resolve => setTimeout(resolve, isMobile ? 500 : 100));

        // 3. Execute token exchange
        await exchangeCodeForSessionToken();

        // 4. Mobile-specific handling with multiple fallbacks
        if (isMobile) {
          // First try regular navigation
          navigate('/', { replace: true });
          
          // Fallback if still on callback page after delay
          setTimeout(() => {
            if (window.location.pathname.includes('/auth/callback')) {
              // Nuclear option for Chrome mobile
              window.location.href = window.location.origin + '/?mobile-redirect=' + Date.now();
            }
          }, 1000);
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback failed:', error);
        // Complete reset on error
        window.location.href = window.location.origin + '/?error=auth_failed';
      }
    };

    // Start auth process with multiple safety checks
    const timer1 = setTimeout(completeAuth, 100);
    
    // Secondary safety check in case first one fails
    const timer2 = setTimeout(() => {
      if (!authCompleted) completeAuth();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [exchangeCodeForSessionToken, navigate]);

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
