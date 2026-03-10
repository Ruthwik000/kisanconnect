import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(email, password);
      toast.success('Login successful!');
    } catch (err) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kisan-card bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="name@example.com"
              className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/70">
            Password
          </label>
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

        {error && (
          <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full kisan-btn-primary py-4 rounded-xl shadow-lg shadow-[#768870]/20 active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Sign In</span>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs font-medium text-[#7a8478]">
            New here? 
            <Link 
              to="/signup" 
              className="text-[#768870] font-black hover:underline ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;