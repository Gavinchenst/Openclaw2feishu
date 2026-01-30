/**
 * Generate a Linux systemd service to keep the Feishu bridge running.
 *
 * Usage:
 *   FEISHU_APP_ID=cli_xxx node setup-service-linux.mjs
 *
 * Then:
 *   systemctl --user start openclaw-feishu-bridge.service
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const APP_ID = process.env.FEISHU_APP_ID;
if (!APP_ID) {
  console.error('Please set FEISHU_APP_ID environment variable');
  process.exit(1);
}

const HOME = os.homedir();
const NODE_PATH = process.execPath; // e.g. /usr/bin/node
const BRIDGE_PATH = path.resolve(import.meta.dirname, 'bridge.mjs');
const WORK_DIR = path.resolve(import.meta.dirname);
const SERVICE_NAME = 'openclaw-feishu-bridge.service';
const SECRET_PATH = process.env.FEISHU_APP_SECRET_PATH || `${HOME}/.openclaw/secrets/feishu_app_secret`;

const service = `[Unit]
Description=OpenClaw Feishu Bridge
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=5
WorkingDirectory=${WORK_DIR}
ExecStart=${NODE_PATH} ${BRIDGE_PATH}
Environment=HOME=${HOME}
Environment=PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
Environment=FEISHU_APP_ID=${APP_ID}
Environment=FEISHU_APP_SECRET_PATH=${SECRET_PATH}

StandardOutput=append:${HOME}/.openclaw/logs/feishu-bridge.out.log
StandardError=append:${HOME}/.openclaw/logs/feishu-bridge.err.log

[Install]
WantedBy=default.target
`;

// Ensure logs dir
fs.mkdirSync(`${HOME}/.openclaw/logs`, { recursive: true });

const outPath = path.join(HOME, '.config', 'systemd', 'user', SERVICE_NAME);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, service);
console.log(`✅ Wrote: ${outPath}`);
console.log();
console.log('To start the service:');
console.log(`  systemctl --user start openclaw-feishu-bridge.service`);
console.log();
console.log('To enable auto-start on boot:');
console.log(`  systemctl --user enable openclaw-feishu-bridge.service`);
console.log();
console.log('To check status:');
console.log(`  systemctl --user status openclaw-feishu-bridge.service`);
console.log();
console.log('To stop:');
console.log(`  systemctl --user stop openclaw-feishu-bridge.service`);