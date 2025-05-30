
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPTIME_FILE = path.join(__dirname, '../database/uptime.json');

let savedStartTime = 0;

if (fs.existsSync(UPTIME_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(UPTIME_FILE));
    if (data.startTime) savedStartTime = data.startTime;
  } catch (e) {
    console.error('Failed to read uptime file:', e);
  }
}

const currentStartTime = Math.floor(Date.now() / 1000); // detik
const totalStartTime = savedStartTime || currentStartTime;
export function saveStartTimeOnExit() {
  fs.writeFileSync(UPTIME_FILE, JSON.stringify({ startTime: totalStartTime }), 'utf-8');
}


export function getTotalUptime() {
  return Math.floor(Date.now() / 1000) - totalStartTime;
}
