// ========== [ IMPORT MODULE ] ==========
import QRCode from "qrcode";
import makeWaSocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  Browsers
} from "baileys";
import readline from "readline";
import { platform } from "process";
import pino from "pino";
import { Boom } from "@hapi/boom";
import NodeCache from "@cacheable/node-cache";
import fetch from "node-fetch";
import { simple, protoType } from "./lib/simple.js";
import lodash from "lodash";
import { Low, JSONFile } from "lowdb";
import fs from "fs";
import path, { join } from "path";
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch
} from "fs";
import { GitHubAdapter } from "./lib/githubAdapter.js";
import chalk from "chalk";
import syntaxerror from "syntax-error";
import { fileURLToPath, pathToFileURL } from "url";
import yargs from "yargs";
import { createRequire } from "module";

// ========== [ GLOBAL PATCHES ] ==========
protoType();

global.__filename = function (pathURL = import.meta.url, rmPrefix = platform !== "win32") {
  return rmPrefix
    ? /file:\/\/\//.test(pathURL)
      ? fileURLToPath(pathURL)
      : pathURL
    : pathToFileURL(pathURL).toString();
};

global.__dirname = function (pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};

global.__require = function (dir = import.meta.url) {
  return createRequire(dir);
};

// ========== [ CONFIG & ARGS ] ==========
await import(`./config.js?v=${Date.now()}`);
const args = process.argv;
const pair = args.includes("--pairing");
const useGithubDB = args.includes("--githubdb");

// ========== [ SETUP ] ==========
const __dirname = global.__dirname(import.meta.url);
const { state, saveCreds } = await useMultiFileAuthState("sessions");
const { version } = await fetchLatestBaileysVersion();
const logger = pino(
  { timestamp: () => `,"time":"${new Date().toJSON()}"` },
  pino.destination("./tmp/wa-logs.txt")
);
logger.level = "info";

// ========== [ UTILITY FUNCTION ] ==========
const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, resolve));
};

function cleanFolder(folderPath, excludeFiles = []) {
  if (!existsSync(folderPath)) return;
  for (let file of readdirSync(folderPath)) {
    const fullPath = join(folderPath, file);
    if (excludeFiles.includes(file)) continue;
    try {
      if (statSync(fullPath).isFile()) unlinkSync(fullPath);
    } catch (err) {
      console.error(`Gagal hapus file ${file}:`, err.message);
    }
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ========== [ DATABASE SETUP ] ==========
const adapter = {
  owner: global.namaGithub,
  repo: global.repoGithub,
  token: global.githubToken,
  path: "database.json",
  branch: "main"
};

global.db = new Low(useGithubDB ? new GitHubAdapter(adapter) : new JSONFile("database/database.json"));
global.DATABASE = global.db;

global.loadDatabase = async () => {
  if (global.db.READ) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!global.db.READ) {
          clearInterval(interval);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1000);
    });
  }

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
  global.db.chain = lodash.chain(global.db.data);
};

// ========== [ CONNECTION ] ==========
const connectionOptions = {
  version,
  logger,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: "silent", stream: "store" }))
  },
  browser: Browsers.ubuntu("Chrome"),
  shouldSyncHistoryMessage: (msg) => {
    console.log(`\x1b[32mMemuat Chat [${msg.progress}%]\x1b[39m`);
    return !!msg.syncType;
  },
  syncFullHistory: true,
  generateHighQualityLinkPreview: true
};

global.conn = simple(connectionOptions);
await global.loadDatabase();

if (pair && !conn.authState.creds.registered) {
  const phoneNumber = await question("Please enter your phone number:\n");
  const code = await conn.requestPairingCode(phoneNumber);
  console.log(`Pairing code: ${code}`);
}

// ========== [ CONNECTION EVENTS ] ==========
async function connectionUpdate(update) {
  const { connection, lastDisconnect, qr } = update;

  if (!pair && qr) {
    QRCode.toString(qr, { type: "terminal", small: true }, (err, url) => {
      if (err) return console.error("QR error:", err);
      console.log(url);
    });
  }

  if (connection === "close") {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

    switch (reason) {
      case DisconnectReason.loggedOut:
        console.log("device logout, logout...");
        await alxzy.logout();
        process.exit(1);
        break;
      case DisconnectReason.restartRequired:
      case DisconnectReason.timedOut:
        console.log("restart/timeout, reload...");
        global.reloadHandler(true);
        break;
    }
  } else if (connection === "open") {
    console.log("Berhasil tersambung, connected");
    if (global.db.data === null) {
      await global.loadDatabase();
      global.db.write();
    }
  }
}

// ========== [ HANDLER RELOADER ] ==========
let isInit = true;
let handler = await import("./handler.js");

global.reloadHandler = async (restartConn) => {
  const Handler = await import("./handler.js");
  if (Object.keys(Handler || {}).length) handler = Handler;

  if (restartConn) {
    try {
      global.conn.ws.close();
    } catch {}
    conn.ev.removeAllListeners();
    global.conn = await simple(connectionOptions);
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

// ========== [ PLUGIN LOADER ] ==========
const pluginFolder = global.__dirname(join(__dirname, "./plugins/index"));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
global.pluginStats = {};

async function filesInit() {
  const pluginFiles = readdirSync(pluginFolder).filter(pluginFilter);

  for (let filename of pluginFiles) {
    const filePath = join(pluginFolder, filename);
    const lastModified = statSync(filePath).mtimeMs;

    if (!global.pluginStats[filename] || global.pluginStats[filename] !== lastModified) {
      try {
        const fileUrl = pathToFileURL(filePath).href + `?update=${Date.now()}`;
        const module = await import(fileUrl);
        global.plugins[filename] = module.default || module;
        global.pluginStats[filename] = lastModified;
        console.log(`[PLUGIN] Loaded: ${filename}`);
      } catch (e) {
        console.error(`[PLUGIN] Error loading: ${filename}`, e);
        delete global.plugins[filename];
      }
    }
  }

  for (let filename in global.plugins) {
    if (!pluginFiles.includes(filename)) {
      delete global.plugins[filename];
      delete global.pluginStats[filename];
      console.log(`[PLUGIN] Removed: ${filename}`);
    }
  }
}

// ========== [ INTERVALS ] ==========
setInterval(() => {
  cleanFolder("./tmp");
  cleanFolder("./sessions", ["creds.json"]);
  conn.logger.info("Folder ./tmp dan ./sessions dibersihkan");
}, 10 * 60 * 1000);

setInterval(() => {
  filesInit();
}, 1000);

global.reloadHandler();
