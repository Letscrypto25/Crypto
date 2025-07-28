import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@getmocha/users-service/react';
import { Bot } from 'lucide-react';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isChrome = /Chrome|CriOS/i.test(navigator.userAgent);

    const handleCallback = async () => {
      try {
        // 1. First clear any existing auth state
        localStorage.removeItem('authState');
        sessionStorage.removeItem('authState');
        
        // 2. Add small delay for Chrome mobile to settle
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 3. Execute the token exchange
        await exchangeCodeForSessionToken();
        
        // 4. Mobile-specific handling
        if (isMobile) {
          // For Chrome mobile, we need to force a hard redirect
          if (isChrome) {
            window.location.href = '/?auth=success&t=' + Date.now();
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback failed:', error);
        // Redirect with error state
        window.location.href = '/?error=auth_failed';
      }
    };

    // Double-check if component is still mounted
    const timer = setTimeout(() => {
      if (isMounted) handleCallback();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
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
