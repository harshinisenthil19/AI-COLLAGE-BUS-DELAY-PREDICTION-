import React, { useState } from 'react';
import {
  Bell,
  Bus,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Play,
  Pause,
  Shield,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLoginModal: () => void;
  onToggleNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLoginModal,
  onToggleNotifications,
}) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    simulationRunning,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    soundEnabled,
    toggleSound,
    unreadNotificationsCount,
  } = useTransit();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navLinks = [
    { id: 'student', label: 'Student Portal', icon: LayoutDashboard },
    { id: 'tracking', label: 'Live Bus Tracking', icon: MapPin },
    { id: 'ai-prediction', label: 'AI Delay Studio', icon: Cpu },
    { id: 'driver', label: 'Driver Console', icon: Gauge },
    { id: 'admin', label: 'Fleet Admin', icon: Shield },
    { id: 'spring-boot', label: 'Spring Boot Architecture', icon: Code2 },
  ];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setRoleMenuOpen(false);
    if (role === 'STUDENT') setActiveTab('student');
    if (role === 'DRIVER') setActiveTab('driver');
    if (role === 'ADMIN') setActiveTab('admin');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(currentRole === 'STUDENT' ? 'student' : currentRole === 'DRIVER' ? 'driver' : 'admin')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Bus className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  CampusTransit <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-medium">AI</span>
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">Delay Prediction & Telemetry Hub</p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Telemetry Simulation Control */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="flex h-2 w-2 relative">
                {simulationRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${simulationRunning ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-slate-300 text-[11px] font-mono">
                {simulationRunning ? 'SIMULATING' : 'PAUSED'}
              </span>
              <button
                onClick={toggleSimulation}
                title={simulationRunning ? 'Pause GPS telemetry simulation' : 'Resume simulation'}
                className="p-1 text-slate-400 hover:text-white transition-colors ml-1"
              >
                {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <select
                aria-label="Simulation speed multiplier"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="bg-transparent text-slate-400 hover:text-slate-200 text-[11px] font-mono focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900">1x</option>
                <option value={2} className="bg-slate-900">2x</option>
                <option value={4} className="bg-slate-900">4x</option>
              </select>
            </div>

            {/* Audio Alert Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute transit alerts' : 'Enable transit sound alerts'}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Notification Drawer Toggle */}
            <button
              onClick={onToggleNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="View Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Role Switcher & Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-medium text-slate-200 leading-tight truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider leading-none">
                    {currentRole}
                  </p>
                </div>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-700/80">
                    <p className="text-xs text-slate-400 font-medium">Switch Active Role:</p>
                    <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleRoleSelect('STUDENT')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        currentRole === 'STUDENT' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <span>Student Portal</span>
                          <span className="block text-[10px] text-slate-400">Priya Sharma (22CS084)</span>
                        </div>
                      </div>
                      {currentRole === 'STUDENT' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    <button
                      onClick={() => handleRoleSelect('DRIVER')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        currentRole === 'DRIVER' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5 text-sky-400" />
                        <div>
                          <span>Driver Console</span>
                          <span className="block text-[10px] text-slate-400">Rajesh Kumar (Bus 07 Pilot)</span>
                        </div>
                      </div>
                      {currentRole === 'DRIVER' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    <button
                      onClick={() => handleRoleSelect('ADMIN')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        currentRole === 'ADMIN' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <div>
                          <span>Fleet Admin</span>
                          <span className="block text-[10px] text-slate-400">Prof. Deshmukh (Director)</span>
                        </div>
                      </div>
                      {currentRole === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-700/80 px-2">
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-md transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>Custom Credentials Sign In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="lg:hidden flex items-center overflow-x-auto py-2 px-4 gap-1.5 border-t border-slate-800/80 scrollbar-none">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
