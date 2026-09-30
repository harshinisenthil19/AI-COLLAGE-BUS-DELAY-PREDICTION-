import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  Bus,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Play,
  Plus,
  Radio,
  Send,
  Square,
  Users,
  Wrench,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { IncidentReport } from '../types';

export const DriverDashboard: React.FC = () => {
  const {
    currentDriver,
    buses,
    routes,
    startTrip,
    endTrip,
    advanceBusToNextStop,
    reportIncident,
    updatePassengerCount,
    updateBus,
  } = useTransit();

  const assignedBus = buses.find((b) => b.id === currentDriver.assignedBusId) || buses[0];
  const assignedRoute = routes.find((r) => r.id === assignedBus.routeId) || routes[0];

  const [selectedIncidentType, setSelectedIncidentType] = useState<IncidentReport['incidentType']>('TRAFFIC_JAM');
  const [incidentDelayMinutes, setIncidentDelayMinutes] = useState<number>(10);
  const [incidentNotes, setIncidentNotes] = useState<string>('');
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  const currentStop = assignedRoute.stops[assignedBus.currentStopIndex] || assignedRoute.stops[0];
  const nextStop = assignedRoute.stops[Math.min(assignedBus.currentStopIndex + 1, assignedRoute.stops.length - 1)];

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const noteText = incidentNotes.trim() || `Pilot reported ${selectedIncidentType.replace('_', ' ')} ahead.`;
    reportIncident(assignedBus.id, selectedIncidentType, noteText, incidentDelayMinutes);
    setIncidentNotes('');
    setReportSuccessMessage(`Alert broadcasted to all students on ${assignedBus.busNumber} (+${incidentDelayMinutes}m delay)`);
    setTimeout(() => setReportSuccessMessage(null), 4000);
  };

  const handleQuickReport = (type: IncidentReport['incidentType'], mins: number, note: string) => {
    reportIncident(assignedBus.id, type, note, mins);
    setReportSuccessMessage(`Quick alert sent: ${note} (+${mins}m)`);
    setTimeout(() => setReportSuccessMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Driver Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md">
            {currentDriver.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{currentDriver.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                Pilot License: {currentDriver.licenseNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assigned Vehicle: <strong className="text-white">{assignedBus.busNumber}</strong> ({assignedBus.registrationPlate}) · {currentDriver.experienceYears} Years Safe Driving
            </p>
          </div>
        </div>

        {/* Trip Management Primary Buttons */}
        <div className="flex items-center gap-3">
          {!assignedBus.isTripActive ? (
            <button
              onClick={() => startTrip(assignedBus.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Trip Schedule</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => endTrip(assignedBus.id)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-rose-950/40"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Conclude Trip</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Live Trip Console & Passenger Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Drive Console & Telemetry */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-850 border border-slate-700/80 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Route Schedule
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{assignedRoute.routeName}</h3>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                assignedBus.status === 'IN_TRANSIT'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : assignedBus.status === 'DELAYED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {assignedBus.status.replace('_', ' ')}
            </span>
          </div>

          {/* Stop Progression Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">Current Stop Node:</span>
              <p className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Stop #{currentStop.sequenceOrder}: {currentStop.name}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Scheduled: {currentStop.scheduledTime} · Landmark: {currentStop.landmark}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">Next Approaching Stop:</span>
              <p className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Stop #{nextStop.sequenceOrder}: {nextStop.name}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Scheduled: {nextStop.scheduledTime}
              </p>
            </div>
          </div>

          {/* Quick Pilot Action Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-300 font-semibold block">Waypoint Navigation:</span>
              <span className="text-[11px] text-slate-400">
                Tap to confirm bus departure and advance to next station.
              </span>
            </div>

            <button
              onClick={() => advanceBusToNextStop(assignedBus.id)}
              disabled={assignedBus.currentStopIndex >= assignedRoute.stops.length - 1}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Depart & Advance to Next Stop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Passenger Boarding Counter & Status Override */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Passenger Counter */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" /> Student Boarding Count
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Cap: {assignedBus.capacity} seats
                  </span>
                </div>
                <div className="flex items-center justify-center my-3">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {assignedBus.currentPassengers}
                  </span>
                  <span className="text-slate-400 text-sm ml-2 font-mono">/ {assignedBus.capacity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => updatePassengerCount(assignedBus.id, -1)}
                  className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updatePassengerCount(assignedBus.id, +1)}
                  className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Status Select */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Manual Status Override:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateBus(assignedBus.id, { status: 'IN_TRANSIT' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    assignedBus.status === 'IN_TRANSIT'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  In Transit
                </button>
                <button
                  onClick={() => updateBus(assignedBus.id, { status: 'AT_STOP' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    assignedBus.status === 'AT_STOP'
                      ? 'bg-amber-500 border-amber-400 text-slate-950'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  At Stop
                </button>
                <button
                  onClick={() => updateBus(assignedBus.id, { status: 'DELAYED' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    assignedBus.status === 'DELAYED'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Delayed
                </button>
                <button
                  onClick={() => updateBus(assignedBus.id, { status: 'MAINTENANCE' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    assignedBus.status === 'MAINTENANCE'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Reporting & Delay Broadcast Section */}
        <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Live Incident & Delay Reporter</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Encountered bottleneck or obstacle? Send instant notification to students and recalculate arrival ETA.
            </p>

            {reportSuccessMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reportSuccessMessage}</span>
              </div>
            )}

            {/* Quick Incident Preset Chips */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] text-slate-400 font-medium block">1-Tap Fast Alerts:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickReport('TRAFFIC_JAM', 8, 'Heavy congestion at junction bottleneck')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                >
                  <span className="text-xs font-medium text-white block">Traffic Jam</span>
                  <span className="text-[10px] text-amber-400 font-mono">+8 min delay</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReport('ROAD_BLOCK', 12, 'Construction detour on main road')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                >
                  <span className="text-xs font-medium text-white block">Road Detour</span>
                  <span className="text-[10px] text-amber-400 font-mono">+12 min delay</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReport('VEHICLE_PUNCTURE', 20, 'Tyre pressure issue / Maintenance pause')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                >
                  <span className="text-xs font-medium text-white block">Vehicle Issue</span>
                  <span className="text-[10px] text-rose-400 font-mono">+20 min delay</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReport('HEAVY_RAIN', 6, 'Waterlogged intersection / Slow crawl')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                >
                  <span className="text-xs font-medium text-white block">Waterlogging</span>
                  <span className="text-[10px] text-amber-400 font-mono">+6 min delay</span>
                </button>
              </div>
            </div>

            {/* Custom Incident Form */}
            <form onSubmit={handleIncidentSubmit} className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Incident Category:</label>
                <select
                  value={selectedIncidentType}
                  onChange={(e) => setSelectedIncidentType(e.target.value as IncidentReport['incidentType'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="TRAFFIC_JAM">Traffic Jam / Congestion</option>
                  <option value="ROAD_BLOCK">Road Repair / Flyover Detour</option>
                  <option value="VEHICLE_PUNCTURE">Vehicle Mechanical Warning</option>
                  <option value="ACCIDENT_AHEAD">Accident Choke Ahead</option>
                  <option value="HEAVY_RAIN">Severe Weather / Waterlogging</option>
                  <option value="BOARDING_SURGE">Excess Student Boarding Surge</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Estimated Delay Added:</span>
                  <span className="font-mono text-amber-400 font-bold">+{incidentDelayMinutes} mins</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={incidentDelayMinutes}
                  onChange={(e) => setIncidentDelayMinutes(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pilot Audio / Notes:</label>
                <input
                  type="text"
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  placeholder="e.g. Signal malfunction at 3rd cross..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Broadcast Live Delay to Students</span>
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Central Dispatch Helpdesk:</span>
            <a href="tel:+918023456700" className="text-amber-400 hover:underline flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3" /> 080-23456700
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
