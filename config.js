import fs from "fs";
import path from "path";
import chalk from "chalk";
import Jimp from "jimp";
import { delay } from "baileys";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ownerPath = path.join(__dirname, "./database/owner.json");
const premiumPath = path.join(__dirname, "./database/premium.json");

// Load JSON data
const ownerData = fs.readFileSync(ownerPath, "utf-8");
const premiumData = fs.readFileSync(premiumPath, "utf-8");

// Global variables
global.owner = ["6283899858313", ...JSON.parse(ownerData)];
global.mods = [];
global.prems = [...JSON.parse(premiumData)];

global.packname = "Sticker created by";
global.author = "Akaza md";
global.githubToken = "github token";
global.namaGithub = "your github name";
global.repoGithub = "your repo name";

global.thumbnail = "https://raw.githubusercontent.com/alands-offc/alxzydb/main/1749919184266.jpeg";
global.thumbnail2 = "https://raw.githubusercontent.com/alands-offc/alxzydb/main/1749919242494.jpeg";
global.alxzy = "https://www.alxzy.xyz/api/";

global.sticker = await import("./lib/Sticker.js");
global.scraper = await import("./lib/scraper.js");
global.Jimp = Jimp;
global.prefix = ["."];

// External reply style
global.externalR = {
  thumbnailUrl: global.thumbnail2,
  mimeType: "image/jpeg",
  title: "Akaza - md",
  body: "Akaza - md New era",
  mediaType: 1,
  sourceUrl: "https://www.alxzy.xyz",
  renderLargerThumbnail: true,
};

// Regex collection for scraper or link validation
global.regex = {
  tiktok: /(?:https?:\/\/)?(?:www\.)?(?:vm\.|vt\.)?tiktok\.com\/[^\s]+/i,
  instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[^\s]+/i,
  facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s]+/i,
  youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+/i,
  pinterest: /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/pin\/[^\s]+/i,
};

// User & leveling system config
global.multiplier = 100; // Semakin tinggi = makin susah naik level
global.claim = {
  limit: 20,
  exp: 30,
};
