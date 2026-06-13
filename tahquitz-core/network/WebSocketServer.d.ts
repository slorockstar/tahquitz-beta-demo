/**
 * TAHQUITZ CORE ENGINE // PROJECT ANTIGRAVITY
 * WebSocketServer.ts - Secure Ingress Layer for Tahquitz Vista Devices
 */
export interface VistaCommandPayload {
    commandId: string;
    type: 'LIGHTING' | 'MEDIA' | 'CLIMATE' | 'ACTUATOR';
    zone: string;
    action: string;
    value: number | string | boolean;
    timestamp: number;
}
export declare class TahquitzWebSocketServer {
    private wss;
    private port;
    private translationEngine;
    constructor(port?: number);
    /**
     * Boots the WebSocket server and binds connection listeners.
     */
    start(): void;
    /**
     * Manages incoming connections from client edge nodes (e.g., 4.3" wall panels, iPads).
     */
    private handleConnection;
    /**
     * Parses and validates incoming JSON commands from Tahquitz Vista.
     */
    private processMessage;
}
//# sourceMappingURL=WebSocketServer.d.ts.map