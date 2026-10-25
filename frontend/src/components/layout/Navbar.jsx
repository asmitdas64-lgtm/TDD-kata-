import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Shield, LogOut, User, Car, PlusCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/vehicles" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center font-black text-black tracking-tighter text-lg group-hover:bg-red-500 transition-colors">
            AP
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm text-zinc-100 uppercase">
              APEX AUTOMOTIVE
            </span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
              Precision Atelier
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/vehicles"
            className="flex items-center space-x-1.5 text-zinc-300 hover:text-white transition-colors"
          >
            <Car className="w-4 h-4 text-red-600" />
            <span>Showroom</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/inventory"
              className="flex items-center space-x-1.5 text-red-500 hover:text-red-400 transition-colors border-l border-zinc-800 pl-4"
            >
              <Shield className="w-4 h-4" />
              <span>Inventory Control</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center space-x-4 border-l border-zinc-800 pl-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-200">{user?.name || user?.email}</span>
                {isAdmin && (
                  <span className="bg-red-600/20 text-red-500 px-1.5 py-0.5 text-[10px] border border-red-600/30 font-bold uppercase">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4">
              <Link
                to="/login"
                className="text-zinc-300 hover:text-white text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
