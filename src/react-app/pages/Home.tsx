import { useAuth } from '@getmocha/users-service/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import LoginForm from '@/react-app/components/LoginForm';

export default function Home() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has already selected a bot version
      const savedVersion = localStorage.getItem('cryptoMindBotVersion');
      if (savedVersion === 'simple' || savedVersion === 'complex') {
        navigate(`/dashboard/${savedVersion}`);
      } else {
        navigate('/select-bot');
      }
    }
  }, [user, navigate]);

  // Add timeout for auth loading
  useEffect(() => {
    if (isPending) {
      const timeout = setTimeout(() => {
        setAuthTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setAuthTimeout(false);
    }
  }, [isPending]);

  // If auth is taking too long, show login form
  if (authTimeout) {
    console.log('Authentication timeout - showing login form');
    return <LoginForm />;
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Loader2 className="w-10 h-10 text-purple-400 mx-auto" />
          </div>
          <p className="text-gray-400 text-sm">Loading CryptoMind...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return null; // Will redirect via useEffect
}
