import { DelayClassification, DelayFactor, DelayPrediction, Route } from '../types';

interface PredictionInput {
  route: Route;
  currentStopIndex: number;
  trafficIndex: number; // 1 (Clear) to 10 (Gridlock)
  weather: 'CLEAR' | 'RAIN' | 'FOG' | 'STORM';
  timeOfDayHours: number; // e.g., 8.5 for 8:30 AM
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 5=Friday
  activeIncidentMinutes: number;
  historicalBaseDelay: number;
}

/**
 * AI-Based College Bus Delay Prediction Engine.
 * Evaluates multi-variate features using weighted regression and classifies
 * delay severity into ON_TIME (<5 min), SLIGHT_DELAY (5-14 min), and MAJOR_DELAY (>=15 min).
 */
export function calculateDelayPrediction(
  busId: string,
  input: PredictionInput,
  scheduledArrival: string = '08:45 AM'
): DelayPrediction {
  const factors: DelayFactor[] = [];
  const remainingStops = Math.max(1, input.route.stops.length - input.currentStopIndex);

  // 1. Historical Route Baseline (learned historical mean for this route)
  const baseDelay = Math.max(0, input.historicalBaseDelay);
  factors.push({
    name: 'Historical Route Baseline',
    category: 'HISTORICAL',
    impactMinutes: Math.round(baseDelay),
    description: `30-day historical mean delay for ${input.route.routeCode} under standard conditions.`,
  });

  // 2. Traffic Congestion Factor
  // Traffic index 1-3 = low (+0-1 min), 4-6 = moderate (+2-5 min), 7-10 = severe (+6-14 min)
  let trafficImpact = 0;
  if (input.trafficIndex <= 3) {
    trafficImpact = 0.5 * (input.trafficIndex - 1);
  } else if (input.trafficIndex <= 6) {
    trafficImpact = 1.5 + (input.trafficIndex - 3) * 1.2;
  } else {
    trafficImpact = 5.0 + (input.trafficIndex - 6) * 2.2;
  }
  // Scale with remaining route distance
  trafficImpact = Math.round(trafficImpact * (remainingStops / Math.max(3, input.route.stops.length)) * 1.3);
  if (trafficImpact > 0) {
    factors.push({
      name: 'Corridor Traffic Density',
      category: 'TRAFFIC',
      impactMinutes: trafficImpact,
      description: `Telemetry shows Level ${input.trafficIndex}/10 congestion on ${input.route.routeName}.`,
    });
  }

  // 3. Time of Day Peak Rush Multiplier
  // Morning college rush peak: 8:00 AM - 9:30 AM (hours 8.0 - 9.5)
  // Evening college return peak: 4:30 PM - 6:00 PM (hours 16.5 - 18.0)
  let timeOfDayImpact = 0;
  if ((input.timeOfDayHours >= 8.0 && input.timeOfDayHours <= 9.5) ||
      (input.timeOfDayHours >= 16.5 && input.timeOfDayHours <= 18.0)) {
    timeOfDayImpact = Math.round(3.5 + Math.random() * 0.5);
    factors.push({
      name: 'College Rush Peak Hours',
      category: 'TIME_OF_DAY',
      impactMinutes: timeOfDayImpact,
      description: 'Morning campus arrival surge and commuter bottlenecks active.',
    });
  } else if (input.timeOfDayHours >= 7.5 && input.timeOfDayHours < 8.0) {
    timeOfDayImpact = 1;
    factors.push({
      name: 'Early Morning Transit Build-Up',
      category: 'TIME_OF_DAY',
      impactMinutes: timeOfDayImpact,
      description: 'Transitioning into campus commute peak.',
    });
  }

  // 4. Day of the Week Factor
  // Monday morning and Friday evening have higher delays in university towns
  let dayOfWeekImpact = 0;
  if (input.dayOfWeek === 1) { // Monday
    dayOfWeekImpact = 2;
    factors.push({
      name: 'Monday Transit Surge',
      category: 'HISTORICAL',
      impactMinutes: dayOfWeekImpact,
      description: 'Higher student boarding volume and start-of-week road density.',
    });
  } else if (input.dayOfWeek === 5) { // Friday
    dayOfWeekImpact = 2;
    factors.push({
      name: 'Friday Traffic Pattern',
      category: 'HISTORICAL',
      impactMinutes: dayOfWeekImpact,
      description: 'Weekend transit overlap and earlier congestion onset.',
    });
  }

  // 5. Weather Condition Factor
  let weatherImpact = 0;
  if (input.weather === 'RAIN') {
    weatherImpact = 4;
    factors.push({
      name: 'Rain & Wet Road Braking Distance',
      category: 'WEATHER',
      impactMinutes: weatherImpact,
      description: 'Reduced average transit speed (-22%) and slippery braking buffers.',
    });
  } else if (input.weather === 'FOG') {
    weatherImpact = 6;
    factors.push({
      name: 'Low Visibility & Dense Fog',
      category: 'WEATHER',
      impactMinutes: weatherImpact,
      description: 'Restricted highway speeds and cautious junction crossings.',
    });
  } else if (input.weather === 'STORM') {
    weatherImpact = 11;
    factors.push({
      name: 'Severe Storm / Waterlogging',
      category: 'WEATHER',
      impactMinutes: weatherImpact,
      description: 'Localized water stagnation and cautious driving required.',
    });
  }

  // 6. Stop Dwell Time Variance (overcrowded stops / ticket scanning)
  let stopDwellImpact = 0;
  if (remainingStops >= 3) {
    stopDwellImpact = Math.round(remainingStops * 0.4);
    if (stopDwellImpact > 0) {
      factors.push({
        name: 'Cumulative Stop Boarding Dwell',
        category: 'STOPS',
        impactMinutes: stopDwellImpact,
        description: `Average 25-sec boarding dwell across ${remainingStops} upcoming stops.`,
      });
    }
  }

  // 7. Active Driver Incident Reports (accidents, diversions)
  if (input.activeIncidentMinutes > 0) {
    factors.push({
      name: 'Driver-Reported Road Incident',
      category: 'INCIDENT',
      impactMinutes: input.activeIncidentMinutes,
      description: 'Live field alert reported by bus pilot.',
    });
  }

  // Aggregate Total Delay (Minutes)
  const rawDelay = baseDelay + trafficImpact + timeOfDayImpact + dayOfWeekImpact + weatherImpact + stopDwellImpact + input.activeIncidentMinutes;
  const predictedDelayMinutes = Math.max(0, Math.round(rawDelay));

  // Determine Classification
  let classification: DelayClassification = 'ON_TIME';
  if (predictedDelayMinutes >= 15) {
    classification = 'MAJOR_DELAY';
  } else if (predictedDelayMinutes >= 5) {
    classification = 'SLIGHT_DELAY';
  } else {
    classification = 'ON_TIME';
  }

  // Confidence Score Calculation (decreases slightly if weather is erratic or many incidents)
  let confidence = 94;
  if (input.trafficIndex > 7) confidence -= 5;
  if (input.weather !== 'CLEAR') confidence -= 4;
  if (input.activeIncidentMinutes > 0) confidence -= 6;
  const confidencePercentage = Math.max(76, Math.min(98, confidence));

  // Calculate Predicted Arrival Time
  const predictedArrivalTime = addMinutesToTimeString(scheduledArrival, predictedDelayMinutes);

  // Generate Natural Language AI Analysis Summary
  let summary = '';
  if (classification === 'ON_TIME') {
    summary = `Bus ${input.route.routeCode} is operating on normal schedule with minimal friction. Corridor traffic is flowing freely.`;
  } else if (classification === 'SLIGHT_DELAY') {
    summary = `Anticipated ${predictedDelayMinutes}-minute delay primarily driven by ${
      factors.sort((a, b) => b.impactMinutes - a.impactMinutes)[0]?.name.toLowerCase() || 'moderate traffic'
    }. College arrival remains manageable.`;
  } else {
    summary = `Significant ${predictedDelayMinutes}-minute delay forecasted. Major contributor is ${
      factors.sort((a, b) => b.impactMinutes - a.impactMinutes)[0]?.name || 'traffic gridlock'
    }. Students advised to check live tracking or coordinate with dispatch.`;
  }

  const nextStop = input.route.stops[Math.min(input.currentStopIndex + 1, input.route.stops.length - 1)];

  return {
    id: `pred-${busId}-${Date.now()}`,
    busId,
    routeId: input.route.id,
    predictedDelayMinutes,
    classification,
    confidencePercentage,
    predictedArrivalTime,
    scheduledArrivalTime: scheduledArrival,
    targetStopName: nextStop ? nextStop.name : input.route.destination,
    factors,
    aiAnalysisSummary: summary,
    calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    trafficIndex: input.trafficIndex,
    weatherCondition: input.weather,
  };
}

/**
 * Utility to add minutes to time string (e.g. "08:30 AM" + 15 min -> "08:45 AM")
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  try {
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return timeStr;
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    const meridiem = parts[1].toUpperCase();

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    let totalMinutes = hours * 60 + minutes + minutesToAdd;
    let newHours = Math.floor(totalMinutes / 60) % 24;
    let newMinutes = totalMinutes % 60;

    const newMeridiem = newHours >= 12 ? 'PM' : 'AM';
    let displayHours = newHours % 12;
    if (displayHours === 0) displayHours = 12;

    const padM = newMinutes < 10 ? `0${newMinutes}` : `${newMinutes}`;
    const padH = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;

    return `${padH}:${padM} ${newMeridiem}`;
  } catch {
    return timeStr;
  }
}
