import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Loader2, Sprout } from 'lucide-react';

const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { isAuthenticated, userProfile, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-[#fdfbf7] text-[#2a3328]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#768870] rounded-lg flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#768870]">Kisan Connect</span>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-[#768870] mb-4" />
        <p className="text-sm font-medium text-[#7a8478]">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if required and not completed
  if (requireOnboarding && userProfile && !userProfile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to dashboard if onboarding is completed but user is on onboarding page
  if (location.pathname === '/onboarding' && userProfile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;