import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Bus,
  Check,
  CheckCheck,
  Info,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    soundEnabled,
    toggleSound,
    unreadNotificationsCount,
  } = useTransit();

  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filterPriority === 'ALL') return true;
    return n.priority === filterPriority;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Transit Alerts & Notices
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">Live push updates from AI delay system</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar & Clear All */}
          <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterPriority('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterPriority === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPriority('HIGH')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterPriority === 'HIGH' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                High Priority
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear list
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <Bell className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
                <p>No active transit alerts.</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Everything is operating on schedule.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    item.read
                      ? 'bg-slate-850/50 border-slate-800 text-slate-400 opacity-75'
                      : item.priority === 'HIGH'
                      ? 'bg-rose-950/20 border-rose-800/40 text-slate-200 shadow-sm'
                      : 'bg-slate-800/90 border-slate-700/80 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          item.priority === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.priority === 'HIGH' ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <Bus className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="font-semibold text-white block">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{item.timestamp}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1 pl-8">
                    {item.message}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] pl-8">
                    <span className="font-mono text-amber-400">{item.busNumber}</span>
                    {!item.read && <span className="text-amber-300 font-medium">Click to mark read</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-center text-[11px] text-slate-500">
            Push alerts are synchronized across Student, Driver, and Admin portals.
          </div>
        </div>
      </div>
    </div>
  );
};
