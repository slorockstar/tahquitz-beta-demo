import { z } from 'zod';
export declare const ServiceConfigSchema: z.ZodObject<{
    serviceName: z.ZodString;
    version: z.ZodString;
    network: z.ZodObject<{
        interface: z.ZodDefault<z.ZodString>;
        protocol: z.ZodDefault<z.ZodEnum<{
            TCP: "TCP";
            UDP: "UDP";
            HTTP: "HTTP";
            HTTPS: "HTTPS";
        }>>;
        port: z.ZodOptional<z.ZodNumber>;
        portRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodNumber;
            end: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export interface ValidationError {
    service: string;
    type: 'SCHEMA_ERROR' | 'PORT_CONFLICT' | 'RANGE_OVERLAP' | 'FILE_ERROR';
    message: string;
    details?: any;
}
export declare class ConfigValidator {
    private configs;
    /**
     * Load and validate a YAML/JSON file against the schema
     */
    loadFromFile(filePath: string): ValidationError[];
    /**
     * Add a config object directly (for In-Process Mode)
     */
    addConfig(config: ServiceConfig): void;
    /**
     * Perform cross-service validation (Conflicts, Exhaustion, Overlaps)
     */
    validateAll(): ValidationError[];
}
//# sourceMappingURL=ConfigValidator.d.ts.map