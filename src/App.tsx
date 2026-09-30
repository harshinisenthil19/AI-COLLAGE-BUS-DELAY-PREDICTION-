/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { BusTrackingView } from './components/BusTrackingView';
import { DelayPredictionStudio } from './components/DelayPredictionStudio';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SpringBootExplorer } from './components/SpringBootExplorer';
import { LoginModal } from './components/LoginModal';
import { NotificationsPanel } from './components/NotificationsPanel';
import { Bus, Code2, ShieldCheck } from 'lucide-react';

function MainAppContent() {
  const { currentRole } = useTransit();
  const [activeTab, setActiveTab] = useState<string>('student');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        />

        <main className="pb-12">
          {activeTab === 'student' && (
            <StudentDashboard onNavigateToMap={() => setActiveTab('tracking')} />
          )}

          {activeTab === 'tracking' && <BusTrackingView />}

          {activeTab === 'ai-prediction' && <DelayPredictionStudio />}

          {activeTab === 'driver' && <DriverDashboard />}

          {activeTab === 'admin' && <AdminDashboard />}

          {activeTab === 'spring-boot' && <SpringBootExplorer />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={(role) => {
          if (role === 'STUDENT') setActiveTab('student');
          if (role === 'DRIVER') setActiveTab('driver');
          if (role === 'ADMIN') setActiveTab('admin');
        }}
      />

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-amber-500" />
            <span className="text-slate-400 font-medium">Campus Transit Operations System</span>
            <span className="text-slate-600">·</span>
            <span>AI Delay Prediction & Fleet Tracking</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('spring-boot')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Spring Boot REST Specs</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Role-Based Access Control</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TransitProvider>
      <MainAppContent />
    </TransitProvider>
  );
}
