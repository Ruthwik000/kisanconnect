import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, Loader2, HelpCircle, Sprout, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { toast } from 'sonner';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && userProfile?.onboardingCompleted) {
      navigate('/dashboard');
    } else if (isAuthenticated && !userProfile?.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, userProfile, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock login for now
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="no-scroll-view bg-[#fdfbf7] text-[#2a3328] font-sans">
      {/* Header */}
      <header className="app-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#768870] rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#768870]">Kisan Connect</span>
        </div>
        <LanguageSelector variant="compact" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 px-4">
        <div className="w-full max-w-sm space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-[#2a3328] tracking-tight">Welcome Back</h1>
            <p className="text-sm font-medium text-[#7a8478]">Please enter your details to login</p>
          </div>

          {/* Form Card */}
          <div className="kisan-card bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5 p-8">
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="name@example.com"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
                className="w-full kisan-btn-primary py-4 rounded-xl shadow-lg shadow-[#768870]/20 active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In</span>}
              </button>

              <div className="text-center">
                <p className="text-xs font-medium text-[#7a8478]">
                  New here? <Link to="/signup" className="text-[#768870] font-black hover:underline ml-1">Create Account</Link>
                </p>
              </div>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-[#7a8478]/40 hover:text-[#768870] transition-colors">
            <HelpCircle className="w-4 h-4" />
            Forgot Password?
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
