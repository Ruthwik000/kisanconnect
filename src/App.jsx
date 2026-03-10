import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { LanguageProvider } from "@/shared/contexts/LanguageContext";
import { LandingPage } from "@/features/dashboard";
import { LoginPage, SignupPage } from "@/features/auth";
import { OnboardingPage, Dashboard } from "@/features/dashboard";
import { ChatPage } from "@/features/chat";
import { DiseasePage } from "@/features/disease-detection";
import { NewsPage } from "@/features/news";
import { ProfilePage } from "@/features/profile";
import ScanHistoryPage from "@/features/disease-detection/pages/ScanHistoryPage";
import ChatHistoryPage from "@/features/chat/pages/ChatHistoryPage";
import NotFound from "@/shared/components/NotFound";
import ProtectedRoute from "@/shared/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />
                
                {/* Protected routes - require authentication and completed onboarding */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requireOnboarding={true}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute requireOnboarding={true}>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="/chat/history" element={
                  <ProtectedRoute requireOnboarding={true}>
                    <ChatHistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/disease" element={
                  <ProtectedRoute requireOnboarding={true}>
                    <DiseasePage />
                  </ProtectedRoute>
                } />
                <Route path="/disease/history" element={
                  <ProtectedRoute requireOnboarding={true}>
                    <ScanHistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/news" element={
                  <ProtectedRoute requireOnboarding={true}>
                    <NewsPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute requireOnboarding={true}>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
