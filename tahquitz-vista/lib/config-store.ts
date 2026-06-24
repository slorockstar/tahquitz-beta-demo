export interface ZoneHardwareConfig {
  id: string; // e.g., 'galley', 'lounge'
  hasMonitors: boolean;
  monitorDetails?: string; // e.g., '24" and 65"'
  hasSpeakers: boolean;
  hasLighting: boolean;
  hasClimate: boolean;
  hasShades: boolean;
}

export interface AircraftConfig {
  tailNumber: string;
  aircraftModel: string;
  customerName: string;
  zones: ZoneHardwareConfig[];
}

export const DEFAULT_AIRCRAFT_CONFIG: AircraftConfig = {
  tailNumber: 'N123VIP',
  aircraftModel: 'Boeing 737 BBJ',
  customerName: 'Default VIP Demo',
  zones: [
    {
      id: 'cockpit',
      hasMonitors: false,
      hasSpeakers: false,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
    },
    {
      id: 'galley',
      hasMonitors: false,
      hasSpeakers: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: false,
    },
    {
      id: 'lounge',
      hasMonitors: true,
      monitorDetails: '24" and 65"',
      hasSpeakers: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
    },
    {
      id: 'master_suite',
      hasMonitors: true,
      monitorDetails: '55" OLED',
      hasSpeakers: true,
      hasLighting: true,
      hasClimate: true,
      hasShades: true,
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
