import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, Loader2, HelpCircle, Sprout, Lock, Phone } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { toast } from 'sonner';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, signIn, sendPasswordReset, signInWithGoogle, isLoading: authLoading } = useAuth();

  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userProfile?.onboardingCompleted) {
      navigate('/dashboard');
    } else if (isAuthenticated && !userProfile?.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, userProfile, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const identifier = loginMethod === 'email' ? email : phone;
    
    if (!identifier || !password) {
      setError(`Please enter both ${loginMethod} and password`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(identifier, password);
      
      if (result.success) {
        toast.success('Login successful!');
        // Navigation will be handled by useEffect
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        toast.success('Google sign-in successful!');
        // Navigation will be handled by useEffect
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const errorMessage = err.message || 'Google sign-in failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const identifier = loginMethod === 'email' ? email : null;
    
    if (!identifier) {
      setError('Please enter your email address first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendPasswordReset(identifier);
      
      if (result.success) {
        toast.success('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="no-scroll-view bg-[#fdfbf7] text-[#2a3328] font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#768870]" />
          <p className="text-sm font-medium text-[#7a8478]">Loading...</p>
        </div>
      </div>
    );
  }

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
            {/* Login Method Toggle */}
            <div className="flex bg-[#f4f2eb] rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white text-[#768870] shadow-sm'
                    : 'text-[#7a8478] hover:text-[#768870]'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                  loginMethod === 'phone'
                    ? 'bg-white text-[#768870] shadow-sm'
                    : 'text-[#7a8478] hover:text-[#768870]'
                }`}
              >
                Phone
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email/Phone Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  {loginMethod === 'email' ? (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  )}
                  <input
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    value={loginMethod === 'email' ? email : phone}
                    onChange={(e) => {
                      if (loginMethod === 'email') {
                        setEmail(e.target.value);
                      } else {
                        setPhone(e.target.value);
                      }
                      setError('');
                    }}
                    placeholder={loginMethod === 'email' ? 'name@example.com' : '+91 98765 43210'}
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                    required
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
                    required
                  />
                </div>
              </div>

              {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || (!email && !phone) || !password}
                className="w-full kisan-btn-primary py-4 rounded-xl shadow-lg shadow-[#768870]/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In</span>}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#eeede6]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-[#7a8478] font-medium">or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-[#eeede6] hover:border-[#768870]/30 py-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#768870]" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-semibold text-[#2a3328]">Continue with Google</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs font-medium text-[#7a8478]">
                  New here? <Link to="/signup" className="text-[#768870] font-black hover:underline ml-1">Create Account</Link>
                </p>
              </div>
            </form>
          </div>

          <button 
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-[#7a8478]/40 hover:text-[#768870] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Forgot Password?
          </button>

          {/* Forgot Password Section */}
          {showForgotPassword && (
            <div className="kisan-card bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5 p-6">
              <div className="text-center space-y-4">
                <h3 className="font-bold text-sm text-[#2a3328]">Reset Password</h3>
                <p className="text-xs text-[#7a8478]">Enter your email to receive a password reset link</p>
                {loginMethod === 'phone' && (
                  <p className="text-xs text-red-500">Password reset is only available for email accounts</p>
                )}
                <button
                  onClick={handleForgotPassword}
                  disabled={isLoading || loginMethod === 'phone' || !email}
                  className="w-full kisan-btn-secondary py-3 rounded-xl disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Email</span>}
                </button>
              </div>
            </div>
          )}

          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
