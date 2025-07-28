import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Fixed import
import { AuthProvider } from '@getmocha/users-service/react';
import { ProfileProvider } from '@/react-app/hooks/useAPI';
import HomePage from "@/react-app/pages/Home";
import AuthCallback from "@/react-app/pages/AuthCallback";
import BotVersionSelector from "@/react-app/components/BotVersionSelector";
import Dashboard from "@/react-app/components/Dashboard";
import ComplexDashboard from "@/react-app/components/complex/ComplexDashboard";

export default function App() {
  return (
    <AuthProvider
      authStorageType="localStorage" // Add explicit storage
      cookiePolicy="none" // Disable cookies for mobile compatibility
    >
      <ProfileProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/auth/callback" 
              element={<AuthCallback 
                onAuthCompleted={() => window.location.href = "/"} // Force full redirect
              />} 
            />
            <Route path="/select-bot" element={<BotVersionSelector />} />
            <Route path="/dashboard/simple" element={<Dashboard />} />
            <Route path="/dashboard/complex" element={<ComplexDashboard />} />
          </Routes>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}
