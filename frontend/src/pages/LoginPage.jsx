import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-[#09090b]">
      {/* Left Editorial Visual Section */}
      <div className="md:w-1/2 relative min-h-[300px] md:min-h-full border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />

        <div className="relative z-10">
          <span className="text-red-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2">
            Client Authentication
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
            Access The <span className="text-red-600">Apex</span> Collection.
          </h1>
        </div>

        <div className="relative z-10 pt-12">
          <p className="text-zinc-400 text-sm max-w-md font-mono">
            Uncompromising engineering. Unrivaled provenance. Acquire premier performance machinery with seamless transaction velocity.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-100">
              Sign In To Account
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Enter your credentials to manage inventory and purchases.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border-l-2 border-red-600 text-red-400 text-xs font-mono flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
                  className="w-full bg-[#141417] border border-zinc-800 focus:border-red-600 text-zinc-100 px-3.5 py-2.5 text-sm font-mono placeholder:text-zinc-600 outline-none transition-colors"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141417] border border-zinc-800 focus:border-red-600 text-zinc-100 px-3.5 py-2.5 text-sm font-mono placeholder:text-zinc-600 outline-none transition-colors"
                  required
                />
                <Lock className="absolute right-3.5 top-3 w-4 h-4 text-zinc-600" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-widest py-3 transition-colors flex items-center justify-center space-x-2 mt-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Authorize Access'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-900 text-center text-xs font-mono text-zinc-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-red-500 hover:text-red-400 font-semibold uppercase">
              Register Atelier Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
