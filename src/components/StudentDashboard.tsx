import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Cpu,
  GraduationCap,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Sparkles,
  Users,
  Volume2,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { addMinutesToTimeString } from '../services/aiPredictionService';

export const StudentDashboard: React.FC<{ onNavigateToMap: () => void }> = ({ onNavigateToMap }) => {
  const {
    currentStudent,
    buses,
    routes,
    predictions,
    notifications,
    updateStudentAssignedStop,
  } = useTransit();

  const [expandedFactors, setExpandedFactors] = useState(false);
  const [reminderActive, setReminderActive] = useState(true);

  // Student's assigned bus and route
  const assignedBus = buses.find((b) => b.id === currentStudent.assignedBusId) || buses[0];
  const assignedRoute = routes.find((r) => r.id === assignedBus.routeId) || routes[0];
  const prediction = predictions[assignedBus.id];

  // Student's stop
  const studentStop = assignedRoute.stops.find((s) => s.id === currentStudent.assignedStopId) || assignedRoute.stops[1];

  // Calculate ETA specifically for student's stop
  const scheduledStopTime = studentStop?.scheduledTime || '08:15 AM';
  const delayMinutes = prediction?.predictedDelayMinutes || 0;
  const estimatedStopTime = addMinutesToTimeString(scheduledStopTime, delayMinutes);

  // Filter notifications relevant to this bus
  const busAlerts = notifications.filter(
    (n) => n.busNumber === assignedBus.busNumber || n.priority === 'HIGH'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Student Profile & Quick Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md">
            {currentStudent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{currentStudent.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-amber-300 font-mono">
                ID: {currentStudent.studentId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentStudent.department} · {currentStudent.year}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 text-right">
            <span className="text-[11px] text-slate-400 block">Assigned Transit</span>
            <span className="text-xs font-semibold text-white flex items-center gap-1.5 justify-end">
              <Bus className="w-3.5 h-3.5 text-amber-400" />
              {assignedBus.busNumber} ({assignedRoute.routeCode})
            </span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 text-right">
            <span className="text-[11px] text-slate-400 block">Your Boarding Stop</span>
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 justify-end">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {studentStop.name}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Transit Status & Delay Prediction Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Live Arrival Card */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-700/90 p-6 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-medium text-slate-400">Live Bus Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-xl font-bold text-white">{assignedBus.busNumber}</h3>
                <span className="text-xs text-slate-400 font-mono">({assignedBus.registrationPlate})</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    assignedBus.status === 'IN_TRANSIT'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : assignedBus.status === 'DELAYED'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {assignedBus.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToMap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Track on Map</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Scheduled Pickup
              </span>
              <p className="text-base font-semibold text-white font-mono mt-1">{scheduledStopTime}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                AI Expected Arrival
              </span>
              <p className="text-base font-bold text-amber-400 font-mono mt-1">{estimatedStopTime}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Predicted Delay
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <p
                  className={`text-base font-bold font-mono ${
                    prediction?.classification === 'ON_TIME'
                      ? 'text-emerald-400'
                      : prediction?.classification === 'SLIGHT_DELAY'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  +{delayMinutes} min
                </p>
                <span className="text-[10px] text-slate-400">
                  ({prediction?.classification?.replace('_', ' ') || 'ON TIME'})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-sky-400" />
                Current Speed
              </span>
              <p className="text-base font-semibold text-slate-200 font-mono mt-1">
                {assignedBus.currentSpeedKmH} km/h
              </p>
            </div>
          </div>

          {/* AI Reasoner Banner */}
          {prediction && (
            <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-300">AI Transit Forecast</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Model Confidence: {prediction.confidencePercentage}%
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{prediction.aiAnalysisSummary}</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedFactors(!expandedFactors)}
                  className="text-slate-400 hover:text-white p-1 transition-colors"
                >
                  {expandedFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {expandedFactors && prediction.factors && (
                <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Feature Impact Attribution:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {prediction.factors.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800"
                      >
                        <div className="truncate pr-2">
                          <span className="text-slate-200 font-medium block truncate">{f.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{f.description}</span>
                        </div>
                        <span className="text-amber-400 font-mono font-semibold text-xs whitespace-nowrap">
                          +{f.impactMinutes}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Boarding Assistant & Driver Contact Card */}
        <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>My Boarding Stop</span>
              </h4>
              <span className="text-[11px] text-slate-400">Stop #{studentStop.sequenceOrder}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 mb-4">
              <p className="text-xs font-semibold text-white">{studentStop.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{studentStop.landmark}</p>
              <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400">Scheduled:</span>
                <span className="text-slate-300 font-mono">{scheduledStopTime}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium">Predicted Arrival:</span>
                <span className="text-amber-300 font-bold font-mono">{estimatedStopTime}</span>
              </div>
            </div>

            {/* Change stop dropdown */}
            <div className="mb-4">
              <label className="block text-[11px] text-slate-400 mb-1">Switch Boarding Stop:</label>
              <select
                value={currentStudent.assignedStopId}
                onChange={(e) => updateStudentAssignedStop(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {assignedRoute.stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    Stop {stop.sequenceOrder}: {stop.name} ({stop.scheduledTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Chime Reminder Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs text-slate-200 block font-medium">Arrival Bell Reminder</span>
                  <span className="text-[10px] text-slate-400 block">Chimes when bus is at stop</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderActive(!reminderActive)}
                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                  reminderActive ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 shadow-md" />
              </button>
            </div>
          </div>

          {/* Pilot Info Box */}
          <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                RK
              </div>
              <div>
                <p className="text-xs font-medium text-white">{assignedBus.driverName}</p>
                <p className="text-[10px] text-slate-400">Pilot · Rating 4.9 ★</p>
              </div>
            </div>
            <a
              href="tel:+919448088210"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
              title="Emergency Call Pilot"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Visual Route Progress Subway Timeline */}
      <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>Route Stops & Live Progression</span>
            </h4>
            <p className="text-xs text-slate-400">
              {assignedRoute.routeName} ({assignedRoute.startPoint} → {assignedRoute.destination})
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Passed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Active Bus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30"></span> Your Stop
            </span>
          </div>
        </div>

        {/* Timeline Sequence */}
        <div className="relative overflow-x-auto pb-4">
          <div className="min-w-[700px] flex items-center justify-between relative px-4">
            {/* Background connecting track */}
            <div className="absolute left-8 right-8 top-5 h-1 bg-slate-700 -z-0" />

            {/* Stops */}
            {assignedRoute.stops.map((stop, index) => {
              const isPassed = index < assignedBus.currentStopIndex;
              const isCurrent = index === assignedBus.currentStopIndex;
              const isStudentStop = stop.id === currentStudent.assignedStopId;

              return (
                <div key={stop.id} className="relative z-10 flex flex-col items-center text-center max-w-[130px]">
                  {/* Stop Marker Node */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-md ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : isStudentStop
                        ? 'bg-sky-500 text-slate-950 ring-4 ring-sky-500/30'
                        : 'bg-slate-800 text-slate-400 border-2 border-slate-700'
                    }`}
                  >
                    {isCurrent ? <Bus className="w-4 h-4 text-slate-950" /> : isPassed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>

                  {/* Student designated badge */}
                  {isStudentStop && (
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold tracking-tight uppercase whitespace-nowrap">
                      YOU BOARD HERE
                    </span>
                  )}

                  {/* Stop Title & Time */}
                  <div className="mt-2">
                    <p className={`text-xs font-medium leading-tight ${isStudentStop ? 'text-sky-300 font-semibold' : 'text-slate-200'}`}>
                      {stop.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{stop.scheduledTime}</p>
                    {delayMinutes > 0 && (
                      <p className="text-[10px] text-amber-400/90 font-mono">
                        ~{addMinutesToTimeString(stop.scheduledTime, delayMinutes)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Relevant Alerts & Bulletins */}
      <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Transit Bulletins & Delay Alerts</span>
          </h4>
          <span className="text-xs text-slate-400">{busAlerts.length} notices</span>
        </div>

        <div className="space-y-3">
          {busAlerts.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                item.priority === 'HIGH'
                  ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  item.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-white">{item.title}</h5>
                  <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
