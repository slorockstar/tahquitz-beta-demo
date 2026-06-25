export type ProjectStatus = 'RFQ' | 'Development' | 'Validation' | 'Active';

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
  status: ProjectStatus;
  softwareVersion: string;
  liveryColor?: string; // Hex color for the exterior paint
  zones: ZoneHardwareConfig[];
}

export const DEFAULT_AIRCRAFT_CONFIG: AircraftConfig = {
  tailNumber: 'N123VIP',
  aircraftModel: 'Boeing 787-9',
  customerName: 'VIP Demo Aircraft',
  status: 'Active',
  softwareVersion: 'SCDP1-02-B / RC02',
  liveryColor: '#D4AF37',
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
      id: 'private_suite',
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
      id: 'guest_lavatory',
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

export const MOCK_FLEET: AircraftConfig[] = [
  DEFAULT_AIRCRAFT_CONFIG,
  {
    tailNumber: 'N999DEV',
    aircraftModel: 'Gulfstream G650',
    customerName: 'Project Orion',
    status: 'Development',
    softwareVersion: 'v0.9.1-beta',
    liveryColor: '#004B87',
    zones: DEFAULT_AIRCRAFT_CONFIG.zones.slice(0, 4) // Smaller aircraft
  },
  {
    tailNumber: 'TBD',
    aircraftModel: 'Bombardier Global 7500',
    customerName: 'Apex Holdings (Pending)',
    status: 'RFQ',
    softwareVersion: 'N/A',
    liveryColor: '#E5E4E2',
    zones: []
  }
];

export function getFleetConfig(): AircraftConfig[] {
  if (typeof window === 'undefined') return MOCK_FLEET;
  const saved = localStorage.getItem('tahquitz-fleet-config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse fleet config', e);
    }
  }
  return MOCK_FLEET;
}

export function saveFleetConfig(fleet: AircraftConfig[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tahquitz-fleet-config', JSON.stringify(fleet));
}

export function getAircraftConfig(): AircraftConfig {
  const fleet = getFleetConfig();
  return fleet[0] || DEFAULT_AIRCRAFT_CONFIG; // Helper for legacy views to just grab the first 'Active' one
}

export function saveAircraftConfig(config: AircraftConfig) {
  const fleet = getFleetConfig();
  const index = fleet.findIndex(a => a.tailNumber === config.tailNumber);
  if (index >= 0) {
    fleet[index] = config;
  } else {
    fleet.push(config);
  }
  saveFleetConfig(fleet);
}
