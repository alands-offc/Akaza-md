import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import QRCode from "qrcode";
import makeWaSocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser, 
    Browsers 
} from "baileys";
import readline from "readline"
import { platform } from 'process'
import pino from "pino";
import { Boom } from "@hapi/boom";
import NodeCache from '@cacheable/node-cache'
import fetch from "node-fetch";
import { simple, protoType } from "./lib/simple.js";
import lodash from "lodash";
import { Low, JSONFile } from 'lowdb';
import fs from "fs";
import path, { join} from "path";
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch
} from 'fs'

import chalk from "chalk";
import syntaxerror from "syntax-error"; 
import { fileURLToPath, pathToFileURL } from "url";
import yargs from "yargs";
protoType()
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
};

global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
};

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
};
const args = process.argv;
const pair = args[2] === "--pairing"
const { chain } = lodash;

const __dirname = global.__dirname(import.meta.url)

const server = createServer();

const wss = new WebSocketServer({ server });

const { state, saveCreds } = await useMultiFileAuthState("sessions");

const { version } = await fetchLatestBaileysVersion();

const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, pino.destination('./wa-logs.txt'))
logger.level = 'info'

const question = (text) => {
    const rl = readline.createInterface({ 
        input: process.stdin, 
        output: process.stdout 
    });
    return new Promise((resolve) => {
        rl.question(text, resolve) 
    });
} 

global.db = new Low(new JSONFile("database/database.json"));

global.DATABASE = global.db;

global.loadDatabase = async () => {
    if (global.db.READ) return new Promise(resolve => setInterval(() => {
        if (!global.db.READ) {
            clearInterval(this);
            resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
    }, 1000));
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read();
    global.db.READ = false;
    global.db.data = {
        chats: {},
        settings: {},
        users: {},
        stats: {},
        ...(global.db.data || {})
    };
    global.db.chain = chain(global.db.data);
};

const connectionOptions = {
    version: version,
    logger,
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino().child({
            level: 'silent',
            stream: 'store'
        }))
    },
    browser: Browsers.ubuntu("Chrome"),
    shouldSyncHistoryMessage: (msg) => {
        console.log(`\x1b[32mMemuat Chat [${msg.progress}%]\x1b[39m`);
        return !!msg.syncType;
    },
    syncFullHistory: true,
    generateHighQualityLinkPreview: true
};
global.conn = simple(connectionOptions)
loadDatabase();
if (pair && !conn.authState.creds.registered) {
		const phoneNumber = await question('Please enter your phone number:\n')
		const code = await conn.requestPairingCode(phoneNumber)
		console.log(`Pairing code: ${code}`)
	}
async function connectionUpdate(update) {
  const {connection, lastDisconnect, qr} = update;
if (!pair && qr) {
  QRCode.toString(qr, {
    type: 'terminal',
    small: true
  }, function (err, url) {
    if (err) {
      console.error("Terjadi kesalahan saat membuat QR code:", err);
      return;
    }
    console.log(url);
  });
}

  if (connection === 'close') { 
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log("device logout, logout...")
            await alxzy.logout()
            process.exit(1)
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("butuh restart, \nrestart...")
          global.reloadHandler(true)
        } else if (reason === DisconnectReason.timedOut) {
          console.log("timeout, reload...")
           global.reloadHandler(true)
        }
  } else if (connection === "open") {
    console.log("Berhasil tersambung, connected");
    if (global.db.data === null) {
      global.loadDatabase()
      global.db.write()
    }
  }
}

function cleanFolder(folderPath, excludeFiles = []) {
    if (!existsSync(folderPath)) return;
    const files = readdirSync(folderPath);
    for (let file of files) {
        const fullPath = join(folderPath, file);
        if (excludeFiles.includes(file)) continue;
        try {
            const stats = statSync(fullPath);
            if (stats.isFile()) unlinkSync(fullPath);
        } catch (err) {
            console.error(`Gagal hapus file ${file}:`, err.message);
        }
    }
}

let isInit = true;
let handler = await import("./handler.js");

global.reloadHandler = async (restatConn) => {
    const Handler = await import("./handler.js");
    if (Object.keys(Handler || {}).length) handler = Handler;
    if (restatConn) {
        try {
            global.conn.ws.close();
        } catch {}
        conn.ev.removeAllListeners()
        global.conn = await simple(connectionOptions),
        isInit = true;
    }
    if (!isInit) {
        conn.ev.off("messages.upsert", conn.handler);
        conn.ev.off("group-participants.update", conn.participantsupdate);
        conn.ev.off("connection.update", conn.connectionUpdate);
        conn.ev.off("creds.update", conn.credsUpdate);
    }
    conn.handler = handler.handler.bind(conn);
    conn.participantsupdate = handler.participantsupdate.bind(conn);
    conn.connectionUpdate = connectionUpdate.bind(conn);
    conn.credsUpdate = saveCreds.bind(conn);
   conn.ev.on("messages.upsert", conn.handler);
   conn.ev.on("group-participants.update", conn.participantsupdate);
    conn.ev.on("connection.update", conn.connectionUpdate);
    conn.ev.on("creds.update", conn.credsUpdate);
    isInit = false;
    return true;
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = filename => /\.js$/.test(filename)
global.plugins = {}
global.pluginStats = {}

async function filesInit() {
  const pluginFiles = readdirSync(pluginFolder).filter(pluginFilter)

  for (let filename of pluginFiles) {
    const filePath = join(pluginFolder, filename)
    const stats = statSync(filePath)
    const lastModified = stats.mtimeMs

    if (!global.pluginStats[filename] || global.pluginStats[filename] !== lastModified) {
      try {
        const fileUrl = pathToFileURL(filePath).href + `?update=${Date.now()}`
        const module = await import(fileUrl)
        global.plugins[filename] = module.default || module
        global.pluginStats[filename] = lastModified
        console.log(`[PLUGIN] Loaded: ${filename}`)
      } catch (e) {
        console.error(`[PLUGIN] Error loading: ${filename}`, e)
        delete global.plugins[filename]
      }
    }
  }

  for (let filename in global.plugins) {
    if (!pluginFiles.includes(filename)) {
      delete global.plugins[filename]
      delete global.pluginStats[filename]
      console.log(`[PLUGIN] Removed: ${filename}`)
    }
  }
}

server.listen(3000, () => {
    console.log('WebSocket berjalan di ws://localhost:3000');
});
if (process.send) {
  process.send('uptime')

  process.on('message', (uptime) => {
    console.log(`Uptime from last session: ${Math.floor(uptime)} seconds`)
  })
}
setInterval(() => {
    cleanFolder('./tmp');
    cleanFolder('./sessions', ['creds.json']);
    console.log(conn.logger.info('Folder ./tmp dan ./sessions  dibersihkan'));
    if (!process.send) {
    global.reloadHandler(true)
    } else {
      process.send("reset")
    }
}, 10 * 60 * 1000); 
setInterval(function() {
  filesInit()
}, 1000);
reloadHandler();
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}
