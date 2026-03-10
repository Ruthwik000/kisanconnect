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
import NotFound from "@/shared/components/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/disease" element={<DiseasePage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
