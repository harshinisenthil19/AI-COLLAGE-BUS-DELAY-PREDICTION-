import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  Info,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Sliders,
  Users,
  Zap,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { addMinutesToTimeString } from '../services/aiPredictionService';
import { BusStop } from '../types';

export const BusTrackingView: React.FC = () => {
  const {
    buses,
    routes,
    predictions,
    globalTrafficIndex,
    setGlobalTrafficIndex,
    globalWeather,
    setGlobalWeather,
    simulationRunning,
    toggleSimulation,
  } = useTransit();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const activeBus = buses.find((b) => b.routeId === activeRoute.id) || buses[0];
  const prediction = predictions[activeBus.id];
  const delayMinutes = prediction?.predictedDelayMinutes || 0;

  // Compute percentage progress along total route stops for graphic
  const totalStops = activeRoute.stops.length;
  const currentStopIndex = Math.min(activeBus.currentStopIndex, totalStops - 1);
  const segmentProgress = activeBus.progressToNextStop / 100;
  const overallPercentage = Math.min(
    100,
    Math.round(((currentStopIndex + segmentProgress) / (totalStops - 1)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Route Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fleet Route Selection</span>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{activeRoute.routeName}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-medium">
              {activeRoute.routeCode}
            </span>
          </h2>
        </div>

        {/* Route Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {routes.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedRouteId(r.id);
                setSelectedStop(null);
              }}
              className={`px-3 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedRouteId === r.id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>{r.routeCode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Telemetry Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Corridor & Transit Map Canvas */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[500px]">
          {/* Map Header Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Live Transit Map & Corridor Radar</p>
                <p className="text-[11px] text-slate-400">
                  {activeRoute.startPoint} ➔ {activeRoute.destination} ({activeRoute.totalDistanceKm} km)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                Speed: {activeBus.currentSpeedKmH} km/h
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg font-mono font-semibold ${
                  prediction?.classification === 'ON_TIME'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : prediction?.classification === 'SLIGHT_DELAY'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                +{delayMinutes}m ({prediction?.classification?.replace('_', ' ') || 'ON TIME'})
              </span>
            </div>
          </div>

          {/* SVG Map Canvas with Dynamic Nodes and Bus Position */}
          <div className="relative my-6 py-6 px-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex-1 flex flex-col justify-center">
            {/* Traffic corridor background grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* SVG Corridor Track */}
            <div className="relative w-full max-w-2xl mx-auto my-auto py-8">
              {/* Main Corridor Line */}
              <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                {/* Traffic Congestion Colored Segments */}
                <div
                  className={`h-full transition-all duration-500 ${
                    globalTrafficIndex > 7
                      ? 'bg-gradient-to-r from-emerald-500 via-rose-500 to-rose-600'
                      : globalTrafficIndex > 4
                      ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>

              {/* Dynamic Animated Bus Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 z-30"
                style={{ left: `${overallPercentage}%` }}
              >
                <div className="relative group">
                  {/* Radar pulse */}
                  <div className="absolute -inset-2 bg-amber-400/30 rounded-full animate-ping pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-950 font-bold cursor-pointer hover:scale-110 transition-transform">
                    <Bus className="w-5 h-5" />
                  </div>
                  {/* Hover Tag */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-lg">
                    {activeBus.busNumber} · {activeBus.currentSpeedKmH} km/h
                  </div>
                </div>
              </div>

              {/* Stop Nodes Along the Path */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-between pointer-events-none">
                {activeRoute.stops.map((stop, idx) => {
                  const isPassed = idx < currentStopIndex;
                  const isCurrent = idx === currentStopIndex;
                  const isSelected = selectedStop?.id === stop.id;

                  return (
                    <div
                      key={stop.id}
                      className="relative pointer-events-auto flex flex-col items-center"
                    >
                      <button
                        onClick={() => setSelectedStop(stop)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-transform hover:scale-125 ${
                          isCurrent
                            ? 'bg-amber-400 border-white text-slate-950 ring-2 ring-amber-400/50'
                            : isPassed
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : isSelected
                            ? 'bg-sky-500 border-white text-slate-950 ring-2 ring-sky-400'
                            : 'bg-slate-900 border-slate-600 text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </button>

                      <div
                        onClick={() => setSelectedStop(stop)}
                        className="cursor-pointer text-center mt-3 max-w-[85px] hidden sm:block"
                      >
                        <p className="text-[11px] font-medium text-slate-300 truncate">{stop.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {addMinutesToTimeString(stop.scheduledTime, delayMinutes)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 mt-6">
              Click any stop node above to inspect stop timings, dwell times, and passenger volume.
            </div>
          </div>

          {/* Selected Stop Details Popover (if clicked) */}
          {selectedStop && (
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white">
                    Stop #{selectedStop.sequenceOrder}: {selectedStop.name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedStop(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Landmark:</span>
                  <span className="text-slate-200">{selectedStop.landmark}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Scheduled Arrival:</span>
                  <span className="text-slate-200 font-mono">{selectedStop.scheduledTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Predicted Arrival:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {addMinutesToTimeString(selectedStop.scheduledTime, delayMinutes)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Boarding Volume:</span>
                  <span className="text-slate-200 font-mono">~{selectedStop.passengerCountExpected} students</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Telemetry Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Free Corridor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Moderate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Jammed
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              GPS Refresh Rate: 1.8s · Lat: {activeBus.latitude}, Lng: {activeBus.longitude}
            </div>
          </div>
        </div>

        {/* Right Telemetry & Interactive Simulation Lab */}
        <div className="space-y-5">
          {/* Active Bus Telemetry Card */}
          <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-400" />
                <span>Bus Telemetry: {activeBus.busNumber}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{activeBus.registrationPlate}</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Passenger Load
                  </span>
                  <span className="font-mono text-white font-medium">
                    {activeBus.currentPassengers} / {activeBus.capacity} ({Math.round((activeBus.currentPassengers / activeBus.capacity) * 100)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(activeBus.currentPassengers / activeBus.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Pilot:</span>
                  <span className="text-white font-medium">{activeBus.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Velocity:</span>
                  <span className="text-amber-300 font-mono font-semibold">{activeBus.currentSpeedKmH} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Next Scheduled Stop:</span>
                  <span className="text-white font-medium truncate max-w-[140px]">
                    {activeRoute.stops[Math.min(activeBus.currentStopIndex + 1, activeRoute.stops.length - 1)]?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination ETA:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {addMinutesToTimeString(activeRoute.stops[activeRoute.stops.length - 1]?.scheduledTime || '08:45 AM', delayMinutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Environment & Traffic Simulator */}
          <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Transit Simulation Controls</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-mono font-medium">LIVE IMPACT</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust traffic intensity and atmospheric conditions below to watch the AI engine adapt ETA forecasts in real time.
            </p>

            {/* Traffic Index Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Corridor Traffic Intensity:</span>
                <span className="font-mono text-amber-400 font-bold">{globalTrafficIndex} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={globalTrafficIndex}
                onChange={(e) => setGlobalTrafficIndex(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Free Flow (1)</span>
                <span>Moderate (5)</span>
                <span>Heavy Congestion (10)</span>
              </div>
            </div>

            {/* Weather Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Weather Conditions:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['CLEAR', 'RAIN', 'FOG', 'STORM'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setGlobalWeather(w)}
                    className={`py-1.5 text-[11px] font-mono rounded-lg transition-colors font-medium ${
                      globalWeather === w
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Play/Pause button */}
            <button
              onClick={toggleSimulation}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                simulationRunning
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulationRunning ? 'animate-spin' : ''}`} />
              <span>{simulationRunning ? 'Pause GPS Telemetry Simulation' : 'Resume Telemetry Simulation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
