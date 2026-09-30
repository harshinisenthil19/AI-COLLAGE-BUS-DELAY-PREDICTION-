import React, { useState } from 'react';
import { Bus, Check, Eye, EyeOff, Lock, Mail, Shield, User, X } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { switchRole } = useTransit();
  const [activeRole, setActiveRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('priya.sharma@campus.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRoleTab = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'STUDENT') {
      setEmail('priya.sharma@campus.edu');
    } else if (role === 'DRIVER') {
      setEmail('rajesh.k@transport.campus.edu');
    } else {
      setEmail('director.transit@campus.edu');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      switchRole(activeRole);
      onSuccessLogin(activeRole);
      onClose();
    }, 400);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      switchRole(role);
      onSuccessLogin(role);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner with College Transit Illustration */}
        <div className="relative h-28 w-full overflow-hidden bg-slate-950">
          <img
            src="/src/assets/images/college_bus_transit_1790687091298.jpg"
            alt="College Transit Bus"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-6 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 backdrop-blur-sm">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">CampusTransit Portal</h3>
              <p className="text-[11px] text-slate-300">Secure Role-Based Authentication</p>
            </div>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/80 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => handleRoleTab('STUDENT')}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                activeRole === 'STUDENT'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleTab('DRIVER')}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                activeRole === 'DRIVER'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => handleRoleTab('ADMIN')}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                activeRole === 'ADMIN'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mb-5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <p className="text-[11px] font-medium text-slate-300 mb-2">Instant Demo One-Click Sign In:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(activeRole)}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/20 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Sign in as {activeRole === 'STUDENT' ? 'Student Priya' : activeRole === 'DRIVER' ? 'Driver Rajesh' : 'Admin Deshmukh'}</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {activeRole === 'STUDENT'
                  ? 'College Email or Student ID'
                  : activeRole === 'DRIVER'
                  ? 'Driver Email or Badge ID'
                  : 'Administrator Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80"
                  placeholder="name@campus.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-amber-400/90 hover:underline cursor-pointer">
                Forgot passkey?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <span>Log In to {activeRole} Console</span>
              )}
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Protected by Campus Transit Spring Security & JWT 256-bit encryption
        </div>
      </div>
    </div>
  );
};
