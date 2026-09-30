import React, { useState } from 'react';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileSpreadsheet,
  Filter,
  MapPin,
  Plus,
  Search,
  Shield,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { Bus as BusType, BusStop, Route } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    buses,
    routes,
    predictions,
    addBus,
    updateBus,
    deleteBus,
    addRoute,
    addStopToRoute,
    assignDriverToBus,
  } = useTransit();

  const [activeTab, setActiveTab] = useState<'FLEET' | 'ROUTES' | 'REPORTS'>('FLEET');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoute, setFilterRoute] = useState('ALL');

  // Modals state
  const [isAddBusModalOpen, setIsAddBusModalOpen] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newBusPlate, setNewBusPlate] = useState('');
  const [newBusCapacity, setNewBusCapacity] = useState(50);
  const [newBusRouteId, setNewBusRouteId] = useState(routes[0]?.id || '');
  const [newBusDriverName, setNewBusDriverName] = useState('Anand Rao');

  // Route Modal
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [newRouteCode, setNewRouteCode] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteStart, setNewRouteStart] = useState('');
  const [newRouteDest, setNewRouteDest] = useState('Campus Main Gate');
  const [newRouteDistance, setNewRouteDistance] = useState(15.0);

  // Stop Modal
  const [selectedRouteForStop, setSelectedRouteForStop] = useState<string | null>(null);
  const [newStopName, setNewStopName] = useState('');
  const [newStopScheduled, setNewStopScheduled] = useState('08:20 AM');
  const [newStopLandmark, setNewStopLandmark] = useState('');

  // Fleet KPIs
  const totalBuses = buses.length;
  const activeTrips = buses.filter((b) => b.isTripActive).length;
  const totalPassengers = buses.reduce((acc, curr) => acc + curr.currentPassengers, 0);

  const delayList = Object.values(predictions).map((p) => p.predictedDelayMinutes);
  const avgFleetDelay = delayList.length > 0 ? (delayList.reduce((a, b) => a + b, 0) / delayList.length).toFixed(1) : '0';
  const onTimeCount = Object.values(predictions).filter((p) => p.classification === 'ON_TIME').length;
  const onTimePercentage = totalBuses > 0 ? Math.round((onTimeCount / totalBuses) * 100) : 100;

  // Filtered buses
  const filteredBuses = buses.filter((b) => {
    const matchesSearch =
      b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.registrationPlate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoute = filterRoute === 'ALL' || b.routeId === filterRoute;
    return matchesSearch && matchesRoute;
  });

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNumber) return;
    addBus({
      busNumber: newBusNumber,
      registrationPlate: newBusPlate || 'KA-04-CB-9000',
      capacity: Number(newBusCapacity),
      routeId: newBusRouteId,
      driverName: newBusDriverName,
    });
    setNewBusNumber('');
    setNewBusPlate('');
    setIsAddBusModalOpen(false);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteCode || !newRouteName) return;
    addRoute({
      routeCode: newRouteCode,
      routeName: newRouteName,
      startPoint: newRouteStart || 'Origin Point',
      destination: newRouteDest,
      totalDistanceKm: Number(newRouteDistance),
    });
    setNewRouteCode('');
    setNewRouteName('');
    setIsAddRouteModalOpen(false);
  };

  const handleCreateStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteForStop || !newStopName) return;
    addStopToRoute(selectedRouteForStop, {
      name: newStopName,
      scheduledTime: newStopScheduled,
      landmark: newStopLandmark || 'Main Junction',
    });
    setNewStopName('');
    setSelectedRouteForStop(null);
  };

  const handleExportCSV = () => {
    const headers = ['Bus Number', 'Plate Number', 'Route Code', 'Driver Name', 'Status', 'Speed (km/h)', 'Passengers', 'Predicted Delay (min)', 'Classification'];
    const rows = buses.map((b) => {
      const pred = predictions[b.id];
      const route = routes.find((r) => r.id === b.routeId);
      return [
        b.busNumber,
        b.registrationPlate,
        route?.routeCode || 'N/A',
        b.driverName,
        b.status,
        b.currentSpeedKmH,
        `${b.currentPassengers}/${b.capacity}`,
        pred?.predictedDelayMinutes || 0,
        pred?.classification || 'ON_TIME',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_transit_fleet_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-medium">
              FLEET DISPATCH CONSOLE
            </span>
            <span className="text-xs text-slate-400">· Campus Central Logistics</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fleet Administration & Delay Governance</h2>
          <p className="text-xs text-slate-400">
            Monitor real-time transit schedules, reassign pilots, manage stops, and download delay analytics reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={() => setIsAddBusModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bus</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Bus className="w-3.5 h-3.5 text-amber-400" /> Total Active Fleet
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white font-mono">{totalBuses}</span>
            <span className="text-xs text-slate-400">({activeTrips} in transit)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Fleet On-Time Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{onTimePercentage}%</span>
            <span className="text-xs text-slate-400">({onTimeCount}/{totalBuses} on time)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Avg Network Delay
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">+{avgFleetDelay}m</span>
            <span className="text-xs text-slate-400">per route trip</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" /> In-Transit Students
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white font-mono">{totalPassengers}</span>
            <span className="text-xs text-slate-400">boarded today</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('FLEET')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'FLEET'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Fleet Management & Live Telemetry
        </button>
        <button
          onClick={() => setActiveTab('ROUTES')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'ROUTES'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Routes & Bus Stop Manager
        </button>
      </div>

      {/* Tab 1: Fleet Management */}
      {activeTab === 'FLEET' && (
        <div className="rounded-2xl bg-slate-850 border border-slate-700/80 overflow-hidden shadow-xl">
          {/* Table Search & Filter Bar */}
          <div className="p-4 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by bus number, plate, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Route Filter:</span>
              <select
                value={filterRoute}
                onChange={(e) => setFilterRoute(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Routes ({routes.length})</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeCode} - {r.routeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700/80 bg-slate-900/60 text-slate-400 font-medium">
                  <th className="py-3 px-4">Bus Identifier</th>
                  <th className="py-3 px-4">Assigned Route</th>
                  <th className="py-3 px-4">Assigned Pilot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4">Passenger Load</th>
                  <th className="py-3 px-4">AI Delay Forecast</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBuses.map((bus) => {
                  const route = routes.find((r) => r.id === bus.routeId);
                  const pred = predictions[bus.id];

                  return (
                    <tr key={bus.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                            <Bus className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{bus.busNumber}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{bus.registrationPlate}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200 block">{route?.routeCode}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                          {route?.routeName}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-white font-medium block">{bus.driverName}</span>
                        <span className="text-[11px] text-slate-400">Assigned Driver</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            bus.status === 'IN_TRANSIT'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : bus.status === 'DELAYED'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {bus.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {bus.currentSpeedKmH} km/h
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="text-white font-medium">{bus.currentPassengers}</span>
                        <span className="text-slate-500"> / {bus.capacity}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold ${
                            pred?.classification === 'ON_TIME'
                              ? 'text-emerald-400'
                              : pred?.classification === 'SLIGHT_DELAY'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          +{pred?.predictedDelayMinutes || 0}m
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({pred?.classification?.replace('_', ' ') || 'ON TIME'})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const newStatus = bus.status === 'IN_TRANSIT' ? 'AT_STOP' : 'IN_TRANSIT';
                              updateBus(bus.id, { status: newStatus });
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Toggle Status"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBus(bus.id)}
                            className="p-1.5 rounded-md hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Decommission Bus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Routes & Bus Stops */}
      {activeTab === 'ROUTES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Active College Transit Routes ({routes.length})</h3>
            <button
              onClick={() => setIsAddRouteModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {routes.map((route) => (
              <div key={route.id} className="rounded-2xl bg-slate-850 border border-slate-700/80 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium">
                      {route.routeCode}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{route.routeName}</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{route.totalDistanceKm} km</span>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Start: <strong className="text-slate-200">{route.startPoint}</strong></span>
                  <span>End: <strong className="text-slate-200">{route.destination}</strong></span>
                </div>

                {/* Stops List */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Stops Sequence ({route.stops.length}):</span>
                    <button
                      onClick={() => setSelectedRouteForStop(route.id)}
                      className="text-amber-400 hover:underline text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Stop
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {route.stops.map((stop, sIdx) => (
                      <div
                        key={stop.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center">
                            {sIdx + 1}
                          </span>
                          <div>
                            <span className="text-slate-200 font-medium">{stop.name}</span>
                            <span className="text-[10px] text-slate-500 block">{stop.landmark}</span>
                          </div>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{stop.scheduledTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {isAddBusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Add New Fleet Bus</h3>
              <button onClick={() => setIsAddBusModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Bus Number Identifier:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bus 24"
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">License Registration Plate:</label>
                <input
                  type="text"
                  placeholder="e.g. KA-04-CB-6712"
                  value={newBusPlate}
                  onChange={(e) => setNewBusPlate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Capacity (Seats):</label>
                  <input
                    type="number"
                    value={newBusCapacity}
                    onChange={(e) => setNewBusCapacity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Assigned Route:</label>
                  <select
                    value={newBusRouteId}
                    onChange={(e) => setNewBusRouteId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.routeCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Assigned Driver Pilot:</label>
                <input
                  type="text"
                  value={newBusDriverName}
                  onChange={(e) => setNewBusDriverName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBusModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                >
                  Add Bus to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {isAddRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Create New College Transit Route</h3>
              <button onClick={() => setIsAddRouteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Route Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R-105"
                    value={newRouteCode}
                    onChange={(e) => setNewRouteCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Distance (km):</label>
                  <input
                    type="number"
                    value={newRouteDistance}
                    onChange={(e) => setNewRouteDistance(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Route Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Ring Shuttle"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Starting Point:</label>
                <input
                  type="text"
                  placeholder="e.g. City Bus Terminal"
                  value={newRouteStart}
                  onChange={(e) => setNewRouteStart(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Destination:</label>
                <input
                  type="text"
                  value={newRouteDest}
                  onChange={(e) => setNewRouteDest(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRouteModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {selectedRouteForStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Add Stop to Route</h3>
              <button onClick={() => setSelectedRouteForStop(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStop} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Stop Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Street Cross"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Scheduled Time:</label>
                <input
                  type="text"
                  placeholder="e.g. 08:25 AM"
                  value={newStopScheduled}
                  onChange={(e) => setNewStopScheduled(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Landmark / Waiting Area:</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Petrol Pump"
                  value={newStopLandmark}
                  onChange={(e) => setNewStopLandmark(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRouteForStop(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
