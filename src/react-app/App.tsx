import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from '@getmocha/users-service/react';
import { ProfileProvider } from '@/react-app/hooks/useAPI'; // Added ProfileProvider
import HomePage from "@/react-app/pages/Home";
import AuthCallback from "@/react-app/pages/AuthCallback";
import BotVersionSelector from "@/react-app/components/BotVersionSelector";
import Dashboard from "@/react-app/components/Dashboard";
import ComplexDashboard from "@/react-app/components/complex/ComplexDashboard";

export default function App() {
  return (
    <AuthProvider>
      {/* Wrap with ProfileProvider to share profile state */}
      <ProfileProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/select-bot" element={<BotVersionSelector />} />
            <Route path="/dashboard/simple" element={<Dashboard />} />
            <Route path="/dashboard/complex" element={<ComplexDashboard />} />
          </Routes>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}
