#!/usr/bin/env node
/**
 * Validate that every command declared in package.json contributes.commands
 * is registered in src/extension.ts.
 */

const fs = require('node:fs');
const path = require('node:path');

const PKG_PATH = path.join(__dirname, '..', 'package.json');
const EXT_PATH = path.join(__dirname, '..', 'src', 'extension.ts');

function fail(message) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
}

function ok(message) {
    console.log(`✓ ${message}`);
}

function main() {
    if (!fs.existsSync(PKG_PATH)) {
        fail(`package.json not found at ${PKG_PATH}`);
        return;
    }

    if (!fs.existsSync(EXT_PATH)) {
        fail(`extension.ts not found at ${EXT_PATH}`);
        return;
    }

    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    const extCode = fs.readFileSync(EXT_PATH, 'utf8');

    const declaredCommands = pkg.contributes?.commands || [];

    if (declaredCommands.length === 0) {
        fail('No commands declared in package.json');
        return;
    }

    const missing = [];
    for (const cmd of declaredCommands) {
        const commandId = cmd.command;
        if (!commandId) {
            fail(`Command missing 'command' field in package.json`);
            continue;
        }

        // Check if the command is registered in extension.js
        // Look for patterns like: registerCommand('commandId', ...)
        const escapedId = commandId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const patterns = [
            new RegExp(`registerCommand\\s*\\(\\s*['"\`]${escapedId}['"\`]`),
            new RegExp(`registerCommand\\s*\\(\\s*["']${escapedId}["']`)
        ];

        const isRegistered = patterns.some(re => re.test(extCode));

        if (!isRegistered) {
            missing.push(commandId);
        }
    }

    if (missing.length > 0) {
        fail(`Commands declared but not registered in extension.ts: ${missing.join(', ')}`);
    } else {
        ok(`All ${declaredCommands.length} declared commands are registered in extension.ts`);
    }
}

main();
