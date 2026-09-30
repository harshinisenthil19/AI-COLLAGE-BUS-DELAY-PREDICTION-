import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Admin,
  Bus,
  BusStop,
  DelayPrediction,
  Driver,
  HistoricalDelayPoint,
  IncidentReport,
  NotificationItem,
  Route,
  Student,
  User,
  UserRole
} from '../types';
import {
  MOCK_ADMIN,
  MOCK_BUSES,
  MOCK_DRIVER,
  MOCK_HISTORICAL_POINTS,
  MOCK_NOTIFICATIONS,
  MOCK_ROUTES,
  MOCK_STUDENT
} from '../data/mockData';
import { calculateDelayPrediction } from '../services/aiPredictionService';
import { soundService } from '../services/audioNotificationService';

interface TransitContextType {
  currentUser: User;
  currentRole: UserRole;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  buses: Bus[];
  routes: Route[];
  predictions: Record<string, DelayPrediction>;
  notifications: NotificationItem[];
  incidentReports: IncidentReport[];
  historicalPoints: HistoricalDelayPoint[];
  simulationRunning: boolean;
  simulationSpeed: number;
  globalWeather: 'CLEAR' | 'RAIN' | 'FOG' | 'STORM';
  globalTrafficIndex: number; // 1 to 10
  soundEnabled: boolean;
  
  // Actions
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  setGlobalWeather: (w: 'CLEAR' | 'RAIN' | 'FOG' | 'STORM') => void;
  setGlobalTrafficIndex: (idx: number) => void;
  toggleSound: () => void;
  
  // Student Actions
  currentStudent: Student;
  updateStudentAssignedStop: (stopId: string) => void;
  
  // Driver Actions
  currentDriver: Driver;
  startTrip: (busId: string) => void;
  endTrip: (busId: string) => void;
  advanceBusToNextStop: (busId: string) => void;
  reportIncident: (busId: string, incidentType: IncidentReport['incidentType'], notes: string, delayMins: number) => void;
  updatePassengerCount: (busId: string, delta: number) => void;
  
  // Admin Actions
  addBus: (busData: Partial<Bus>) => void;
  updateBus: (busId: string, busData: Partial<Bus>) => void;
  deleteBus: (busId: string) => void;
  addRoute: (routeData: Partial<Route>) => void;
  addStopToRoute: (routeId: string, stopData: Partial<BusStop>) => void;
  assignDriverToBus: (driverId: string, busId: string) => void;
  
  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotificationsCount: number;
}

const TransitContext = createContext<TransitContextType | undefined>(undefined);

export const TransitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [currentUser, setCurrentUser] = useState<User>(MOCK_STUDENT);
  const [currentStudent, setCurrentStudent] = useState<Student>(MOCK_STUDENT);
  const [currentDriver, setCurrentDriver] = useState<Driver>(MOCK_DRIVER);
  const [currentAdmin] = useState<Admin>(MOCK_ADMIN);

  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [historicalPoints] = useState<HistoricalDelayPoint[]>(MOCK_HISTORICAL_POINTS);

  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [globalWeather, setGlobalWeather] = useState<'CLEAR' | 'RAIN' | 'FOG' | 'STORM'>('CLEAR');
  const [globalTrafficIndex, setGlobalTrafficIndex] = useState<number>(5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Computed AI predictions per bus
  const [predictions, setPredictions] = useState<Record<string, DelayPrediction>>({});

  // Recalculate predictions whenever dependencies change
  useEffect(() => {
    const newPredictions: Record<string, DelayPrediction> = {};
    buses.forEach((bus) => {
      const route = routes.find((r) => r.id === bus.routeId) || routes[0];
      const activeIncidents = incidentReports.filter((i) => i.busId === bus.id && i.active);
      const incidentDelay = activeIncidents.reduce((acc, curr) => acc + curr.estimatedDelayMinutes, 0);

      const prediction = calculateDelayPrediction(
        bus.id,
        {
          route,
          currentStopIndex: bus.currentStopIndex,
          trafficIndex: globalTrafficIndex,
          weather: globalWeather,
          timeOfDayHours: 8.4, // 8:24 AM peak
          dayOfWeek: 1, // Monday
          activeIncidentMinutes: incidentDelay,
          historicalBaseDelay: 3.5,
        },
        route.stops[Math.min(bus.currentStopIndex + 1, route.stops.length - 1)]?.scheduledTime || '08:45 AM'
      );
      newPredictions[bus.id] = prediction;
    });

    setPredictions(newPredictions);
  }, [buses, routes, globalTrafficIndex, globalWeather, incidentReports]);

  // Simulation loop: advances bus progress smoothly
  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (!bus.isTripActive || bus.status === 'COMPLETED' || bus.status === 'MAINTENANCE') {
            return bus;
          }

          const route = routes.find((r) => r.id === bus.routeId);
          if (!route || route.stops.length === 0) return bus;

          const totalStops = route.stops.length;
          const currentStop = route.stops[bus.currentStopIndex];
          const nextStop = route.stops[Math.min(bus.currentStopIndex + 1, totalStops - 1)];

          // Advance progress
          let increment = 2.5 * simulationSpeed;
          // Slower if high traffic
          if (globalTrafficIndex > 7) increment *= 0.6;
          if (globalWeather === 'RAIN' || globalWeather === 'FOG') increment *= 0.8;

          let newProgress = bus.progressToNextStop + increment;
          let newStopIndex = bus.currentStopIndex;
          let newStatus: Bus['status'] = bus.status;
          let newSpeed = Math.max(15, Math.min(52, Math.round(35 + (Math.random() * 8 - 4))));

          if (newProgress >= 100) {
            newProgress = 0;
            newStopIndex = bus.currentStopIndex + 1;

            if (newStopIndex >= totalStops - 1) {
              newStopIndex = totalStops - 1;
              newStatus = 'COMPLETED';
              newSpeed = 0;

              // Add notification
              addNotification({
                type: 'STATUS_CHANGE',
                title: `${bus.busNumber} Arrived at Campus`,
                message: `${bus.busNumber} reached ${route.destination}. Morning trip concluded.`,
                busNumber: bus.busNumber,
                priority: 'LOW',
              });
            } else {
              newStatus = 'AT_STOP';
              newSpeed = 0;

              // Notify students for arrival at that stop
              const arrivedStop = route.stops[newStopIndex];
              if (bus.id === currentStudent.assignedBusId && arrivedStop.id === currentStudent.assignedStopId) {
                soundService.playArrivalChime();
                addNotification({
                  type: 'ARRIVING_SOON',
                  title: `Your Bus Has Arrived!`,
                  message: `${bus.busNumber} is currently at your stop (${arrivedStop.name}). Please board now.`,
                  busNumber: bus.busNumber,
                  priority: 'HIGH',
                });
              }
            }
          } else {
            newStatus = 'IN_TRANSIT';
          }

          // Interpolate GPS coordinates between current and next stop
          const progressRatio = newProgress / 100;
          const lat = currentStop.latitude + (nextStop.latitude - currentStop.latitude) * progressRatio;
          const lng = currentStop.longitude + (nextStop.longitude - currentStop.longitude) * progressRatio;

          return {
            ...bus,
            progressToNextStop: Math.round(newProgress),
            currentStopIndex: newStopIndex,
            status: newStatus,
            currentSpeedKmH: newSpeed,
            latitude: Number(lat.toFixed(5)),
            longitude: Number(lng.toFixed(5)),
            lastUpdated: 'Just now',
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [simulationRunning, simulationSpeed, globalTrafficIndex, globalWeather, routes, currentStudent]);

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'STUDENT') {
      setCurrentUser(currentStudent);
    } else if (role === 'DRIVER') {
      setCurrentUser(currentDriver);
    } else {
      setCurrentUser(currentAdmin);
    }
  };

  const toggleSimulation = () => {
    setSimulationRunning((prev) => !prev);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundService.setSoundEnabled(next);
  };

  const updateStudentAssignedStop = (stopId: string) => {
    setCurrentStudent((prev) => ({
      ...prev,
      assignedStopId: stopId,
    }));
  };

  const startTrip = (busId: string) => {
    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              isTripActive: true,
              status: 'IN_TRANSIT',
              currentStopIndex: 0,
              progressToNextStop: 0,
              tripStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : b
      )
    );
    addNotification({
      type: 'TRIP_STARTED',
      title: 'Trip Initiated by Driver',
      message: `Morning college transit run has begun. Live tracking is active.`,
      busNumber: 'Bus 07',
      priority: 'MEDIUM',
    });
  };

  const endTrip = (busId: string) => {
    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              isTripActive: false,
              status: 'COMPLETED',
              currentSpeedKmH: 0,
              progressToNextStop: 0,
            }
          : b
      )
    );
    addNotification({
      type: 'STATUS_CHANGE',
      title: 'Trip Concluded',
      message: `The bus has completed its designated route schedule.`,
      busNumber: 'Bus 07',
      priority: 'LOW',
    });
  };

  const advanceBusToNextStop = (busId: string) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        const route = routes.find((r) => r.id === b.routeId);
        if (!route) return b;
        const nextIdx = Math.min(b.currentStopIndex + 1, route.stops.length - 1);
        return {
          ...b,
          currentStopIndex: nextIdx,
          progressToNextStop: 0,
          status: nextIdx === route.stops.length - 1 ? 'COMPLETED' : 'IN_TRANSIT',
        };
      })
    );
  };

  const reportIncident = (
    busId: string,
    incidentType: IncidentReport['incidentType'],
    notes: string,
    delayMins: number
  ) => {
    const newIncident: IncidentReport = {
      id: `inc-${Date.now()}`,
      busId,
      driverName: currentDriver.name,
      incidentType,
      description: notes,
      estimatedDelayMinutes: delayMins,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true,
    };

    setIncidentReports((prev) => [newIncident, ...prev]);

    // Mark bus status as DELAYED
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'DELAYED' } : b))
    );

    // Audio cue
    soundService.playDelayWarningChime();

    // Alert students
    addNotification({
      type: 'INCIDENT',
      title: `Driver Alert: ${incidentType.replace('_', ' ')}`,
      message: `${notes} (+${delayMins} min estimated delay). AI model has updated arrival estimates.`,
      busNumber: 'Bus 07',
      priority: 'HIGH',
    });
  };

  const updatePassengerCount = (busId: string, delta: number) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        const updated = Math.max(0, Math.min(b.capacity, b.currentPassengers + delta));
        return { ...b, currentPassengers: updated };
      })
    );
  };

  const addBus = (busData: Partial<Bus>) => {
    const newBus: Bus = {
      id: `bus-${Date.now()}`,
      busNumber: busData.busNumber || `Bus ${buses.length + 1}`,
      registrationPlate: busData.registrationPlate || 'KA-04-CB-9999',
      capacity: busData.capacity || 50,
      currentPassengers: 0,
      routeId: busData.routeId || routes[0].id,
      driverId: busData.driverId || 'driver-01',
      driverName: busData.driverName || 'Assigned Driver',
      status: 'IDLE',
      currentSpeedKmH: 0,
      currentStopIndex: 0,
      progressToNextStop: 0,
      latitude: 12.9352,
      longitude: 77.6245,
      isTripActive: false,
      lastUpdated: 'Just added',
    };
    setBuses((prev) => [...prev, newBus]);
    addNotification({
      type: 'STATUS_CHANGE',
      title: 'Fleet Expanded',
      message: `${newBus.busNumber} added to campus fleet and ready for assignment.`,
      busNumber: newBus.busNumber,
      priority: 'LOW',
    });
  };

  const updateBus = (busId: string, busData: Partial<Bus>) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, ...busData, lastUpdated: 'Just now' } : b))
    );
  };

  const deleteBus = (busId: string) => {
    setBuses((prev) => prev.filter((b) => b.id !== busId));
  };

  const addRoute = (routeData: Partial<Route>) => {
    const newRoute: Route = {
      id: `route-${Date.now()}`,
      routeCode: routeData.routeCode || `R-${routes.length + 101}`,
      routeName: routeData.routeName || 'New Campus Route',
      startPoint: routeData.startPoint || 'Origin Point',
      destination: routeData.destination || 'Campus Gate',
      totalDistanceKm: routeData.totalDistanceKm || 15.0,
      standardDurationMinutes: routeData.standardDurationMinutes || 40,
      activeBusesCount: 0,
      trafficLevel: 'LOW',
      stops: routeData.stops || [],
    };
    setRoutes((prev) => [...prev, newRoute]);
  };

  const addStopToRoute = (routeId: string, stopData: Partial<BusStop>) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId) return r;
        const newStop: BusStop = {
          id: `stop-${Date.now()}`,
          name: stopData.name || 'New Stop',
          code: stopData.code || `STP-${r.stops.length + 1}`,
          sequenceOrder: r.stops.length + 1,
          scheduledTime: stopData.scheduledTime || '08:30 AM',
          latitude: stopData.latitude || 12.95,
          longitude: stopData.longitude || 77.6,
          landmark: stopData.landmark || 'Main Road',
          passengerCountExpected: stopData.passengerCountExpected || 10,
          dwellTimeMinutes: 1,
        };
        return {
          ...r,
          stops: [...r.stops, newStop],
        };
      })
    );
  };

  const assignDriverToBus = (driverId: string, busId: string) => {
    const bus = buses.find((b) => b.id === busId);
    if (!bus) return;
    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              driverId,
              driverName: driverId === currentDriver.id ? currentDriver.name : 'Assigned Pilot',
            }
          : b
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <TransitContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentUser,
        switchRole,
        buses,
        routes,
        predictions,
        notifications,
        incidentReports,
        historicalPoints,
        simulationRunning,
        simulationSpeed,
        globalWeather,
        globalTrafficIndex,
        soundEnabled,
        toggleSimulation,
        setSimulationSpeed,
        setGlobalWeather,
        setGlobalTrafficIndex,
        toggleSound,
        currentStudent,
        updateStudentAssignedStop,
        currentDriver,
        startTrip,
        endTrip,
        advanceBusToNextStop,
        reportIncident,
        updatePassengerCount,
        addBus,
        updateBus,
        deleteBus,
        addRoute,
        addStopToRoute,
        assignDriverToBus,
        markNotificationAsRead,
        clearAllNotifications,
        unreadNotificationsCount,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
};
