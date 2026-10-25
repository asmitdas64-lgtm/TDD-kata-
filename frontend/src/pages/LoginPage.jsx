import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AlertCircle, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/vehicles';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Authentication failed. Please verify credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/80 p-8 sm:p-10 shadow-2xl relative">
        {/* Subtle accent border on top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

        {/* Clean Header */}
        <div className="mb-8 text-center">
          <div className="inline-block px-2.5 py-0.5 mb-3 bg-red-950/50 border border-red-800/40 text-red-500 font-mono text-[10px] tracking-widest uppercase">
            Authentication
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
            Sign In
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Enter your credentials to access your account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-950/50 border-l-2 border-red-600 text-red-400 text-xs font-mono flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@domain.com"
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600/40 text-zinc-100 pl-3.5 pr-10 py-2.5 text-sm font-mono placeholder:text-zinc-600 outline-none transition-colors"
                required
              />
              <Mail className="absolute right-3.5 top-3 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-2">
              Security Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600/40 text-zinc-100 pl-3.5 pr-10 py-2.5 text-sm font-mono placeholder:text-zinc-600 outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-600 hover:text-zinc-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-widest py-3 transition-colors flex items-center justify-center space-x-2 mt-6 cursor-pointer"
          >
            <span>{submitting ? 'Authenticating...' : 'Authorize Access'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Clean Link to Register */}
        <div className="mt-8 pt-6 border-t border-zinc-900 text-center text-xs font-mono text-zinc-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-500 hover:text-red-400 font-semibold uppercase ml-1 transition-colors">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
