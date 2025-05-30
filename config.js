import fs from "fs";
import path from "path";
import chalk from "chalk";
import Jimp from "jimp";
import * as req from "al-http-request";
import { delay } from "baileys";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ownerPath = path.join(__dirname, "./database/owner.json");
const premiumPath = path.join(__dirname, "./database/premium.json");

const ownerData = fs.readFileSync(ownerPath, "utf-8");
const premiumData = fs.readFileSync(premiumPath, "utf-8");

global.owner = ["6283899858313"];
global.mods = [];
global.prems = [];

global.packname = "Sticker created by";
global.author = "Akaza md";

global.thumbnail = "https://cdn.alands.xyz/files/683946b7595edbc3c978cf9a?filename=images.jpeg";
global.thumbnail2 = "https://cdn.alands.xyz/files/6839464e595edbc3c978cf96?filename=images.webp";
global.alxzy = "https://www.alxzy.xyz/api/";
global.sticker = await import("./lib/Sticker.js");
global.scraper = await import("./lib/scraper.js");
global.jimp = await import("./lib/Jimp.js?update=" + Date.now());
global.Jimp = Jimp;
global.req = req.req;
global.prefix = new RegExp('^[' + '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-'.replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

global.externalR = {
  thumbnailUrl: global.thumbnail2,
  mimeType: "image/jpeg",
  title: "Akaza - md",
  body: "Akaza - md New era",
  mediaType: 1,
  sourceUrl: "https://www.alxzy.xyz",
  renderLargerThumbnail: true
};

global.regex = {
  tiktok: /(?:https?:\/\/)?(?:www\.)?(?:vm\.|vt\.)?tiktok\.com\/[^\s]+/i,
  instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[^\s]+/i,
  facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s]+/i,
  youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+/i,
  pinterest: /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/pin\/[^\s]+/i
};

// user
global.multiplier = 100; // Semakin tinggi, semakin susah naik level
global.claim = {
  limit: 20,
  exp: 30
};

global.owner.push(...JSON.parse(ownerData));
global.prems.push(...JSON.parse(premiumData));
