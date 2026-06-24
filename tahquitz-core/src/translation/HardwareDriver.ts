/**
 * Tahquitz Core - Hardware Translation Layer
 * 
 * This file acts as the structural template for Option A (Tahquitz Core translation).
 * It demonstrates how the hardware-agnostic architecture works by listening to
 * WebSockets from Tahquitz Vista and translating those high-level intents
 * into raw aircraft data payloads (ARINC 429, TCP/IP, CAN).
 */

export interface WebSocketPayload {
    action: string;      // e.g., "SET_LIGHTING", "SET_VOLUME"
    zone: string;        // e.g., "galley", "lounge"
    value: number;       // e.g., 50 (percentage)
    timestamp: number;
}

export interface AircraftBusPacket {
    protocol: 'ARINC-429' | 'TCP-IP' | 'CAN';
    targetHardware: string; // e.g., "ALTO_AUDIO_AMP", "COLLINS_ROUTER"
    hexPayload: string;
    description: string;
}

export class HardwareDriver {
    
    /**
     * Ingests a high-level UI command from Tahquitz Vista and routes it
     * to the appropriate hardware translator based on the aircraft configuration.
     */
    public processIncomingWebsocket(payload: WebSocketPayload): AircraftBusPacket {
        console.log(`[CORE] Ingested UI Intent: ${payload.action} in ${payload.zone} to ${payload.value}`);
        
        switch (payload.action) {
            case 'SET_LIGHTING':
                return this.translateToCANBusLighting(payload.zone, payload.value);
            case 'SET_VOLUME':
                return this.translateToARINC429Audio(payload.zone, payload.value);
            case 'SWITCH_MEDIA':
                return this.translateToTCPIPRouting(payload.zone, payload.value);
            default:
                throw new Error(`[CORE] Unknown action: ${payload.action}`);
        }
    }

    /**
     * Translates a lighting request into a CAN bus frame intended for RS-485 LED controllers.
     */
    private translateToCANBusLighting(zone: string, intensity: number): AircraftBusPacket {
        // Mocking a CAN bus standard frame (11-bit identifier)
        const zoneIdHex = this.getZoneHexCode(zone);
        const intensityHex = intensity.toString(16).padStart(2, '0').toUpperCase();
        const payload = `11F${zoneIdHex}00${intensityHex}`;
        
        return {
            protocol: 'CAN',
            targetHardware: 'LHT_LIGHTING_CONTROLLER',
            hexPayload: payload,
            description: `CAN Frame: Set ${zone} lights to ${intensity}%`
        };
    }

    /**
     * Translates an audio request into an ARINC 429 binary word intended for ALTO Aviation amps.
     */
    private translateToARINC429Audio(zone: string, volume: number): AircraftBusPacket {
        // Mocking an ARINC 429 32-bit word: 
        // Parity (1 bit) | SSM (2 bits) | Data (19 bits) | SDI (2 bits) | Label (8 bits)
        // Let's assume Label 144 (octal) is Cabin Audio.
        const labelHex = "64"; // 144 octal -> 100 decimal -> 64 hex
        const sdi = "01";
        const volumeHex = volume.toString(16).padStart(4, '0').toUpperCase();
        const payload = `${labelHex}${sdi}${volumeHex}0`; // 32-bit approximation
        
        return {
            protocol: 'ARINC-429',
            targetHardware: 'ALTO_AUDIO_AMP',
            hexPayload: payload,
            description: `ARINC Word: Set ${zone} volume to ${volume}%`
        };
    }

    /**
     * Translates a media routing request into a TCP/IP Hex string for Collins Venue matrices.
     */
    private translateToTCPIPRouting(zone: string, sourceId: number): AircraftBusPacket {
        const payload = `0x01 0x04 0x${sourceId.toString(16).padStart(2, '0')} 0x00`;
        
        return {
            protocol: 'TCP-IP',
            targetHardware: 'COLLINS_VENUE_ROUTER',
            hexPayload: payload,
            description: `TCP/IP Matrix Switch: Route Source ${sourceId} to ${zone}`
        };
    }

    /**
     * Internal lookup mapping friendly zone names to physical bus identifiers.
     */
    private getZoneHexCode(zone: string): string {
        const map: Record<string, string> = {
            'cockpit': '0A',
            'galley': '0B',
            'lounge': '0C',
            'master_suite': '0D'
        };
        return map[zone] || 'FF';
    }
}
