#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { ConfigValidator } from '../src/validator/ConfigValidator.js';
function main() {
    const args = process.argv.slice(2);
    const configDir = args[0];
    if (!configDir) {
        console.error(`Usage: ife-config-check <path-to-config-directory>`);
        process.exit(1);
    }
    const absoluteDir = path.resolve(configDir);
    if (!fs.existsSync(absoluteDir) || !fs.statSync(absoluteDir).isDirectory()) {
        console.error(`[FATAL] Directory not found: ${absoluteDir}`);
        process.exit(1);
    }
    const validator = new ConfigValidator();
    let loadErrors = [];
    // Read all YAML and JSON files in the directory
    const files = fs.readdirSync(absoluteDir);
    for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')) {
            const filePath = path.join(absoluteDir, file);
            const fileErrors = validator.loadFromFile(filePath);
            if (fileErrors.length > 0) {
                loadErrors = loadErrors.concat(fileErrors);
            }
        }
    }
    // Check Schema Errors
    if (loadErrors.length > 0) {
        console.error(`\n[FATAL] ❌ Schema Validation Failed:`);
        loadErrors.forEach(err => {
            console.error(`  - ${err.service}: ${err.message}`);
            if (err.details) {
                console.error(`    Details: ${JSON.stringify(err.details)}`);
            }
        });
        process.exit(1);
    }
    // Cross-service Validation
    const validationErrors = validator.validateAll();
    if (validationErrors.length > 0) {
        console.error(`\n[FATAL] ❌ Network Conflict Validation Failed:`);
        validationErrors.forEach(err => {
            console.error(`  - [${err.type}] Service '${err.service}': ${err.message}`);
        });
        process.exit(1);
    }
    console.log(`\n[SUCCESS] ✅ All ${files.length} configuration files passed strict validation. No port conflicts detected.`);
    process.exit(0);
}
main();
//# sourceMappingURL=ife-config-check.js.map