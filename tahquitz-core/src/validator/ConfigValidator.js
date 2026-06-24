import { z } from 'zod';
import * as fs from 'fs';
import * as yaml from 'yaml';
// Standardized JSON/YAML Schema for Tahquitz Core Services
export const ServiceConfigSchema = z.object({
    serviceName: z.string().min(1),
    version: z.string(),
    network: z.object({
        interface: z.string().default('0.0.0.0'),
        protocol: z.enum(['TCP', 'UDP', 'HTTP', 'HTTPS']).default('TCP'),
        port: z.number().int().min(1).max(65535).optional(),
        portRange: z.object({
            start: z.number().int().min(1).max(65535),
            end: z.number().int().min(1).max(65535)
        }).optional()
    }).refine(data => data.port !== undefined || data.portRange !== undefined, {
        message: "A service must define either a single 'port' or a 'portRange'."
    })
});
export class ConfigValidator {
    configs = [];
    /**
     * Load and validate a YAML/JSON file against the schema
     */
    loadFromFile(filePath) {
        const errors = [];
        try {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            // Attempt YAML parse (JSON is valid YAML)
            const parsedData = yaml.parse(fileContents);
            // Validate schema
            const result = ServiceConfigSchema.safeParse(parsedData);
            if (!result.success) {
                errors.push({
                    service: filePath,
                    type: 'SCHEMA_ERROR',
                    message: 'Configuration does not match the strict ServiceSchema',
                    details: result.error.errors
                });
            }
            else {
                this.configs.push(result.data);
            }
        }
        catch (err) {
            errors.push({
                service: filePath,
                type: 'FILE_ERROR',
                message: `Failed to read or parse file: ${err.message}`
            });
        }
        return errors;
    }
    /**
     * Add a config object directly (for In-Process Mode)
     */
    addConfig(config) {
        this.configs.push(config);
    }
    /**
     * Perform cross-service validation (Conflicts, Exhaustion, Overlaps)
     */
    validateAll() {
        const errors = [];
        // Check for identical static port conflicts
        const portMap = new Map(); // 'protocol:port' -> serviceName
        for (const config of this.configs) {
            if (config.network.port) {
                const key = `${config.network.protocol}:${config.network.port}`;
                if (portMap.has(key)) {
                    errors.push({
                        service: config.serviceName,
                        type: 'PORT_CONFLICT',
                        message: `Static port conflict: ${key} is already claimed by ${portMap.get(key)}`
                    });
                }
                else {
                    portMap.set(key, config.serviceName);
                }
            }
        }
        // Check for overlapping dynamic port ranges
        const ranges = this.configs.filter(c => c.network.portRange).map(c => ({
            service: c.serviceName,
            start: c.network.portRange.start,
            end: c.network.portRange.end,
            protocol: c.network.protocol
        }));
        for (let i = 0; i < ranges.length; i++) {
            for (let j = i + 1; j < ranges.length; j++) {
                const r1 = ranges[i];
                const r2 = ranges[j];
                if (r1.protocol === r2.protocol) {
                    // Check for intersection
                    if (r1.start <= r2.end && r1.end >= r2.start) {
                        errors.push({
                            service: r1.service,
                            type: 'RANGE_OVERLAP',
                            message: `Port range overlap detected between ${r1.service} (${r1.start}-${r1.end}) and ${r2.service} (${r2.start}-${r2.end}) on protocol ${r1.protocol}`
                        });
                    }
                }
            }
        }
        // Check if any static port falls within another service's dynamic range
        for (const config of this.configs) {
            if (config.network.port) {
                for (const range of ranges) {
                    if (config.serviceName !== range.service && config.network.protocol === range.protocol) {
                        if (config.network.port >= range.start && config.network.port <= range.end) {
                            errors.push({
                                service: config.serviceName,
                                type: 'RANGE_OVERLAP',
                                message: `Static port ${config.network.port} falls within dynamic range of ${range.service} (${range.start}-${range.end})`
                            });
                        }
                    }
                }
            }
        }
        return errors;
    }
}
//# sourceMappingURL=ConfigValidator.js.map