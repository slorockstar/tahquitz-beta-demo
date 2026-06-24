export interface ZoneHardwareConfig {
  id: string;
  hasMonitors: boolean;
  monitorDetails?: string; 
  hasSpeakers: boolean;
  hasHeadphones: boolean;
  hasLighting: boolean;
  hasClimate: boolean;
  hasShades: boolean;
  hasMovingMap: boolean;
  hasPassengerCall: boolean;
  hasAuxPorts: boolean;
}

export interface AircraftConfig {
  tailNumber: string;
  aircraftModel: string;
  customerName: string;
  zones: ZoneHardwareConfig[];
}

export const DEFAULT_AIRCRAFT_CONFIG: AircraftConfig = {
  tailNumber: 'N123VIP',
  aircraftModel: 'Boeing 787-9',
  customerName: 'VIP Demo Aircraft',
  zones: [
    {
      id: 'crew_terminal',
      hasMonitors: true,
      monitorDetails: '15" Touchscreen',
      hasSpeakers: false,
      hasHeadphones: false,
      hasLighting: true,
      hasClimate: true,
      hasShades: false,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    },
    {
      id: 'aerosuite',
      hasMonitors: true,
      monitorDetails: '32" LCD',
      hasSpeakers: true,
      hasHeadphones: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    },
    {
      id: 'premium_lounge',
      hasMonitors: true,
      monitorDetails: '32" LCD',
      hasSpeakers: true,
      hasHeadphones: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    },
    {
      id: 'guest_bedroom',
      hasMonitors: true,
      monitorDetails: '42" OLED',
      hasSpeakers: true,
      hasHeadphones: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    },
    {
      id: 'majlis',
      hasMonitors: true,
      monitorDetails: '65" OLED',
      hasSpeakers: true,
      hasHeadphones: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    },
    {
      id: 'vip_bedroom',
      hasMonitors: true,
      monitorDetails: '65" OLED',
      hasSpeakers: true,
      hasHeadphones: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    },
    {
      id: 'vip_lavatory',
      hasMonitors: false,
      hasSpeakers: true,
      hasHeadphones: false,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: false,
      hasPassengerCall: true,
      hasAuxPorts: false,
    },
    {
      id: 'business_class',
      hasMonitors: true,
      monitorDetails: '18" Seatback',
      hasSpeakers: false,
      hasHeadphones: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    },
    {
      id: 'economy_class',
      hasMonitors: true,
      monitorDetails: '11" Seatback',
      hasSpeakers: false,
      hasHeadphones: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
      hasMovingMap: true,
      hasPassengerCall: true,
      hasAuxPorts: true,
    }
  ]
};

export function getAircraftConfig(): AircraftConfig {
  if (typeof window === 'undefined') return DEFAULT_AIRCRAFT_CONFIG;
  const saved = localStorage.getItem('tahquitz-aircraft-config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse aircraft config', e);
    }
  }
  return DEFAULT_AIRCRAFT_CONFIG;
}

export function saveAircraftConfig(config: AircraftConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tahquitz-aircraft-config', JSON.stringify(config));
}
