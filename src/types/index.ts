export type UserRole = 'STUDENT' | 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Student extends User {
  role: 'STUDENT';
  studentId: string;
  department: string;
  year: string;
  assignedBusId: string;
  assignedStopId: string;
}

export interface Driver extends User {
  role: 'DRIVER';
  licenseNumber: string;
  assignedBusId: string;
  experienceYears: number;
  rating: number;
  status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_BREAK';
}

export interface Admin extends User {
  role: 'ADMIN';
  designation: string;
  department: string;
}

export type BusStatus = 'IN_TRANSIT' | 'AT_STOP' | 'DELAYED' | 'MAINTENANCE' | 'COMPLETED' | 'IDLE';

export type DelayClassification = 'ON_TIME' | 'SLIGHT_DELAY' | 'MAJOR_DELAY';

export interface BusStop {
  id: string;
  name: string;
  code: string;
  sequenceOrder: number;
  scheduledTime: string; // e.g. "08:15 AM"
  estimatedTime?: string;
  latitude: number;
  longitude: number;
  landmark: string;
  passengerCountExpected: number;
  dwellTimeMinutes: number;
}

export interface Route {
  id: string;
  routeCode: string;
  routeName: string;
  startPoint: string;
  destination: string;
  totalDistanceKm: number;
  standardDurationMinutes: number;
  stops: BusStop[];
  activeBusesCount: number;
  trafficLevel: 'LOW' | 'MODERATE' | 'HEAVY';
}

export interface Bus {
  id: string;
  busNumber: string; // e.g., "Bus 07"
  registrationPlate: string;
  capacity: number;
  currentPassengers: number;
  routeId: string;
  driverId: string;
  driverName: string;
  status: BusStatus;
  currentSpeedKmH: number;
  currentStopIndex: number; // Index in route.stops
  progressToNextStop: number; // 0 to 100%
  latitude: number;
  longitude: number;
  isTripActive: boolean;
  tripStartTime?: string;
  lastUpdated: string;
}

export interface DelayFactor {
  name: string;
  category: 'TRAFFIC' | 'WEATHER' | 'TIME_OF_DAY' | 'STOPS' | 'HISTORICAL' | 'INCIDENT';
  impactMinutes: number;
  description: string;
}

export interface DelayPrediction {
  id: string;
  busId: string;
  routeId: string;
  predictedDelayMinutes: number;
  classification: DelayClassification;
  confidencePercentage: number;
  predictedArrivalTime: string;
  scheduledArrivalTime: string;
  targetStopName: string;
  factors: DelayFactor[];
  aiAnalysisSummary: string;
  calculatedAt: string;
  trafficIndex: number; // 1 to 10
  weatherCondition: 'CLEAR' | 'RAIN' | 'FOG' | 'STORM';
}

export interface IncidentReport {
  id: string;
  busId: string;
  driverName: string;
  incidentType: 'TRAFFIC_JAM' | 'ROAD_BLOCK' | 'VEHICLE_PUNCTURE' | 'ACCIDENT_AHEAD' | 'HEAVY_RAIN' | 'BOARDING_SURGE';
  description: string;
  estimatedDelayMinutes: number;
  timestamp: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'DELAY_ALERT' | 'STATUS_CHANGE' | 'INCIDENT' | 'TRIP_STARTED' | 'ARRIVING_SOON';
  title: string;
  message: string;
  busNumber: string;
  timestamp: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  read: boolean;
}

export interface HistoricalDelayPoint {
  date: string;
  routeCode: string;
  dayOfWeek: string;
  avgDelayMinutes: number;
  predictedDelayMinutes: number;
  weather: string;
  peakHour: boolean;
}

export interface FleetSummaryStats {
  totalBuses: number;
  activeTrips: number;
  onTimeBuses: number;
  delayedBuses: number;
  averageDelayMinutes: number;
  totalPassengersToday: number;
}
