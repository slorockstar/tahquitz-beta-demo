/**
 * TAHQUITZ CORE ENGINE // PROJECT ANTIGRAVITY
 * TranslationEngine.ts - Hyper-modular payload routing and protocol builder interface.
 */
import type { VistaCommandPayload } from '../network/WebSocketServer.js';
export declare class TranslationEngine {
    constructor();
    /**
     * Processes an incoming parsed UI command.
     * This logic maps the state mutation to the specific physical layer
     * (e.g., dimming a zone triggers an ARINC 429 word).
     */
    processCommand(payload: VistaCommandPayload): void;
    private translateLightingCommand;
}
//# sourceMappingURL=TranslationEngine.d.ts.map