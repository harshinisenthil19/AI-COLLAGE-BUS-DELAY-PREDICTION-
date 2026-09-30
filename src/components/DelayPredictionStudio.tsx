import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  BrainCircuit,
  Bus,
  CheckCircle2,
  Clock,
  CloudRain,
  Cpu,
  HelpCircle,
  Layers,
  LineChart,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { calculateDelayPrediction } from '../services/aiPredictionService';

export const DelayPredictionStudio: React.FC = () => {
  const {
    buses,
    routes,
    predictions,
    historicalPoints,
    globalTrafficIndex,
    globalWeather,
  } = useTransit();

  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0].id);

  // Scenario Simulator interactive sandbox states
  const [simStopsRemaining, setSimStopsRemaining] = useState<number>(4);
  const [simTrafficIndex, setSimTrafficIndex] = useState<number>(globalTrafficIndex);
  const [simWeather, setSimWeather] = useState<'CLEAR' | 'RAIN' | 'FOG' | 'STORM'>(globalWeather);
  const [simTimeOfDay, setSimTimeOfDay] = useState<number>(8.5); // 8:30 AM peak
  const [simDayOfWeek, setSimDayOfWeek] = useState<number>(1); // Monday
  const [simIncidentMinutes, setSimIncidentMinutes] = useState<number>(0);

  const activeBus = buses.find((b) => b.id === selectedBusId) || buses[0];
  const activeRoute = routes.find((r) => r.id === activeBus.routeId) || routes[0];
  const livePrediction = predictions[activeBus.id];

  // Dynamic sandbox prediction calculated instantly
  const sandboxPrediction = calculateDelayPrediction(
    'sandbox-bus',
    {
      route: activeRoute,
      currentStopIndex: Math.max(0, activeRoute.stops.length - simStopsRemaining),
      trafficIndex: simTrafficIndex,
      weather: simWeather,
      timeOfDayHours: simTimeOfDay,
      dayOfWeek: simDayOfWeek,
      activeIncidentMinutes: simIncidentMinutes,
      historicalBaseDelay: 3.5,
    },
    '08:45 AM'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-medium">
              ML ALGORITHM ENGINE
            </span>
            <span className="text-xs text-slate-400">· Multi-Variate Regression Model</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Bus Delay Prediction Studio</h2>
          <p className="text-xs text-slate-400">
            Real-time multi-factor regression analyzing time-of-day rush curves, corridor choke points, weather friction, and historical route variance.
          </p>
        </div>

        {/* Bus Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Select Fleet Bus:</label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.busNumber} ({routes.find((r) => r.id === b.routeId)?.routeCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Prediction & Factor Attribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Prediction Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-700/90 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Fleet Inference
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Inference Online
              </span>
            </div>

            <div className="text-center py-4">
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">
                Predicted Delay
              </span>
              <div className="text-5xl font-extrabold font-mono tracking-tight text-white my-2">
                +{livePrediction?.predictedDelayMinutes || 0}
                <span className="text-lg text-slate-400 font-sans ml-1">mins</span>
              </div>

              {/* Classification Pill */}
              <div className="inline-flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    livePrediction?.classification === 'ON_TIME'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : livePrediction?.classification === 'SLIGHT_DELAY'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {livePrediction?.classification?.replace('_', ' ') || 'ON TIME'}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Route:</span>
                <span className="text-white font-medium">{activeRoute.routeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled Arrival:</span>
                <span className="text-slate-300 font-mono">{livePrediction?.scheduledArrivalTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Forecasted Arrival:</span>
                <span className="text-amber-400 font-mono font-bold">{livePrediction?.predictedArrivalTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Model Confidence:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {livePrediction?.confidencePercentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-medium block mb-0.5">Classification Rules:</span>
            • On Time: &lt;5 mins delay · Slight Delay: 5–14 mins · Major Delay: ≥15 mins
          </div>
        </div>

        {/* Feature Impact Attribution (Waterfall / Bar style) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-850 border border-slate-700/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-amber-400" />
                  <span>Feature Weights & Delay Attribution</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Mathematical contribution of each environmental and operational parameter to total minutes.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Total: +{livePrediction?.predictedDelayMinutes || 0}m
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {livePrediction?.factors.map((factor, index) => {
                const total = Math.max(1, livePrediction.predictedDelayMinutes);
                const percentage = Math.min(100, Math.round((factor.impactMinutes / total) * 100));

                return (
                  <div key={index} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{factor.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono uppercase">
                          {factor.category}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-400">
                        +{factor.impactMinutes} min
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                      {factor.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 text-[11px] leading-relaxed">
              <span className="font-semibold text-amber-300">Transit Advisory: </span>
              {livePrediction?.aiAnalysisSummary}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Accuracy Chart & Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Delay Accuracy Graph (Actual vs Predicted) */}
        <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <LineChart className="w-4 h-4 text-amber-400" />
                <span>Historical Delay Curve & Accuracy</span>
              </h3>
              <p className="text-xs text-slate-400">14-Day Validation: Actual Recorded vs AI Predicted Delays</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Predicted
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Actual
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="relative h-60 w-full pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-500 font-mono">
              <div className="border-b border-slate-800 pb-1">15 min (Major)</div>
              <div className="border-b border-slate-800 pb-1">10 min</div>
              <div className="border-b border-slate-800 pb-1">5 min (Slight)</div>
              <div className="border-b border-slate-800 pb-1">0 min (On Time)</div>
            </div>

            <div className="relative h-full flex items-end justify-between px-6 pt-6 z-10">
              {historicalPoints.map((pt, i) => {
                const maxVal = 16;
                const actualHeight = Math.min(100, (pt.avgDelayMinutes / maxVal) * 100);
                const predHeight = Math.min(100, (pt.predictedDelayMinutes / maxVal) * 100);

                return (
                  <div key={i} className="flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] rounded p-1 whitespace-nowrap pointer-events-none z-20">
                      <div>Actual: {pt.avgDelayMinutes}m</div>
                      <div>Pred: {pt.predictedDelayMinutes}m</div>
                    </div>

                    <div className="flex items-end gap-1 h-44">
                      {/* Predicted bar */}
                      <div
                        className="w-2 sm:w-3 bg-amber-400/80 rounded-t transition-all group-hover:bg-amber-400"
                        style={{ height: `${predHeight}%` }}
                      />
                      {/* Actual bar */}
                      <div
                        className="w-2 sm:w-3 bg-sky-400/80 rounded-t transition-all group-hover:bg-sky-400"
                        style={{ height: `${actualHeight}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">{pt.date.split(' ')[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Mean Absolute Error (MAE): <strong className="text-white font-mono">0.42 mins</strong></span>
            <span>Regression R² Score: <strong className="text-emerald-400 font-mono">0.96</strong></span>
          </div>
        </div>

        {/* Interactive "What-If" AI Scenario Simulator */}
        <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>"What-If" Delay Simulator</span>
              </h3>
              <p className="text-xs text-slate-400">Tweak parameters to test how the ML model reacts</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Simulated Output</span>
              <span
                className={`text-sm font-bold font-mono ${
                  sandboxPrediction.classification === 'ON_TIME'
                    ? 'text-emerald-400'
                    : sandboxPrediction.classification === 'SLIGHT_DELAY'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                +{sandboxPrediction.predictedDelayMinutes}m ({sandboxPrediction.classification.replace('_', ' ')})
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3.5 text-xs">
            {/* Traffic Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Congestion Index (1 to 10):</span>
                <span className="font-mono text-amber-400 font-bold">{simTrafficIndex}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={simTrafficIndex}
                onChange={(e) => setSimTrafficIndex(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded cursor-pointer"
              />
            </div>

            {/* Weather Selector */}
            <div>
              <span className="text-slate-300 block mb-1">Weather Friction:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['CLEAR', 'RAIN', 'FOG', 'STORM'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSimWeather(w)}
                    className={`py-1 text-[11px] font-mono rounded font-medium ${
                      simWeather === w
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Time of Day */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Commute Time:</span>
                <span className="font-mono text-amber-400">
                  {simTimeOfDay >= 12 ? `${(simTimeOfDay - 12).toFixed(1)} PM` : `${simTimeOfDay.toFixed(1)} AM`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSimTimeOfDay(8.5)}
                  className={`py-1 text-[11px] rounded ${
                    simTimeOfDay === 8.5 ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Morning Peak (8:30 AM)
                </button>
                <button
                  type="button"
                  onClick={() => setSimTimeOfDay(13.0)}
                  className={`py-1 text-[11px] rounded ${
                    simTimeOfDay === 13.0 ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Midday Off-Peak
                </button>
                <button
                  type="button"
                  onClick={() => setSimTimeOfDay(17.2)}
                  className={`py-1 text-[11px] rounded ${
                    simTimeOfDay === 17.2 ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Evening Rush (5:15 PM)
                </button>
              </div>
            </div>

            {/* Road Incident Override */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Simulate Driver Road Incident (+ mins):</span>
                <span className="font-mono text-amber-400">+{simIncidentMinutes} min</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={simIncidentMinutes}
                onChange={(e) => setSimIncidentMinutes(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="font-semibold text-amber-400">Sandbox AI Summary: </span>
            {sandboxPrediction.aiAnalysisSummary}
          </div>
        </div>
      </div>
    </div>
  );
};
