/**
 * TAHQUITZ CORE ENGINE // PROJECT ANTIGRAVITY
 * WebSocketServer.ts - Secure Ingress Layer for Tahquitz Vista Devices
 */
import { WebSocketServer as WSS, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { TranslationEngine } from '../translation/TranslationEngine.js';
export class TahquitzWebSocketServer {
    wss;
    port;
    translationEngine;
    constructor(port = 8080) {
        this.port = port;
        this.translationEngine = new TranslationEngine();
        // Initialize standard WebSocket server
        this.wss = new WSS({ port: this.port });
    }
    /**
     * Boots the WebSocket server and binds connection listeners.
     */
    start() {
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
        console.log(`[TAHQUITZ CORE] Secure WebSocket Server listening on port ${this.port}`);
    }
    /**
     * Manages incoming connections from client edge nodes (e.g., 4.3" wall panels, iPads).
     */
    handleConnection(ws, req) {
        const clientIp = req.socket.remoteAddress;
        console.log(`[TAHQUITZ CORE] New client connection established from IP: ${clientIp}`);
        ws.on('message', (message) => {
            this.processMessage(ws, message.toString());
        });
        ws.on('close', () => {
            console.log(`[TAHQUITZ CORE] Client disconnected (IP: ${clientIp})`);
        });
        ws.on('error', (error) => {
            console.error(`[TAHQUITZ CORE] WebSocket Error (IP: ${clientIp}):`, error);
        });
        // Send an immediate handshake acknowledgment
        ws.send(JSON.stringify({
            status: 'CONNECTED',
            message: 'Tahquitz Core Engine Ready'
        }));
    }
    /**
     * Parses and validates incoming JSON commands from Tahquitz Vista.
     */
    processMessage(ws, rawMessage) {
        try {
            const payload = JSON.parse(rawMessage);
            // Simple structural validation before passing to the engine
            if (!payload.type || !payload.zone || payload.value === undefined) {
                throw new Error('Invalid Command Payload Structure');
            }
            console.log(`[TAHQUITZ CORE] Received ${payload.type} command for zone ${payload.zone}: ${payload.action}=${payload.value}`);
            // Route the command down to the hyper-modular Translation Engine
            this.translationEngine.processCommand(payload);
            // Acknowledge receipt
            ws.send(JSON.stringify({
                status: 'ACK',
                commandId: payload.commandId
            }));
        }
        catch (error) {
            console.error('[TAHQUITZ CORE] Failed to parse incoming WebSocket message:', error);
            ws.send(JSON.stringify({
                status: 'ERROR',
                message: 'Malformed Payload'
            }));
        }
    }
}
// Boot the server if run directly
if (require.main === module) {
    const server = new TahquitzWebSocketServer(8080);
    server.start();
}
//# sourceMappingURL=WebSocketServer.js.map