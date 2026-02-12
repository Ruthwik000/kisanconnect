import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, Loader2, HelpCircle, Sprout, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { toast } from 'sonner';

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock signup for now
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
      toast.error(err.message || 'Signup failed');
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
            <div className="w-16 h-16 bg-[#f4f2eb] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#eeede6]">
              <UserPlus className="w-8 h-8 text-[#768870]" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#2a3328] tracking-tight">Create Account</h1>
            <p className="text-sm font-medium text-[#7a8478]">Join Kisan Connect today</p>
          </div>

          {/* Form Card */}
          <div className="kisan-card bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5 p-8">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="name@example.com"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

              {/* Signup Button */}
              <button
                onClick={handleSignup}
                disabled={isLoading || !email || !password || !confirmPassword}
                className="w-full kisan-btn-primary py-3.5 rounded-xl shadow-lg shadow-[#768870]/20 active:scale-[0.98] mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Account</span>}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs font-medium text-[#7a8478]">
                  Already have an account? <Link to="/login" className="text-[#768870] font-black hover:underline ml-1">Sign In</Link>
                </p>
              </div>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-[#7a8478]/40 hover:text-[#768870] transition-colors">
            <HelpCircle className="w-4 h-4" />
            Need Assistance?
          </button>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
