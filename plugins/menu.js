import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import { pathToFileURL } from "url"
import { getTotalUptime } from "../lib/uptime.js"
const pluginFolder = './plugins'

async function loadPlugins() {
  const plugins = {}
  const files = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'))

  for (const file of files) {
    const filePath = path.join(pluginFolder, file)
    try {
      const module = await import(pathToFileURL(filePath).href)
      const main =
        typeof module.default === 'function'
          ? module.default
          : typeof module.handler === 'function'
            ? module.handler
            : async () => {}

      Object.assign(main, module)
      plugins[file] = main
    } catch (e) {
      console.error(`Gagal load plugin "${file}":`, e)
    }
  }

  return plugins
}

function tags() {
  const result = {};

  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    const tags = plugin.tags || [];
    let commands = plugin.command;

    if (!Array.isArray(commands)) {
      if (commands) {
        commands = [commands]; 
      } else {
        commands = []; 
      }
    }

    for (const tag of tags) {
      if (!result[tag]) result[tag] = [];

      for (const cmd of commands) {
        result[tag].push({
          command: cmd,
          file: name,
          limit: plugin.limit || false,
          premium: plugin.premium || false,
          owner: plugin.owner || false
        });
      }
    }
  }

  return result;
}

function formatCommandList(tagObject) {
  let result = ""

  for (const tag in tagObject) {
    result += `┌─「 *${tag.charAt(0).toUpperCase() + tag.slice(1)}* 」\n`

    for (const cmd of tagObject[tag]) {
      let flags = []
      if (cmd.limit) flags.push("L")
      if (cmd.premium) flags.push("P")
      if (cmd.owner) flags.push("R")

      let flagStr = flags.length ? ` (${flags.join(",")})` : ""
      result += `│ • .${cmd.command}${flagStr}\n`
    }

    result += `└────\n\n`
  }

  return result.trim()
}

function fuptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  let parts = []
  if (days) parts.push(`${days}days`)
  if (hours) parts.push(`${hours}hours`)
  if (minutes) parts.push(`${minutes}minutes`)
  if (secs) parts.push(`${secs}seconds`)

  return parts.join(" ")
}

function formatWaktu(timestamp = Date.now()) {
  const date = new Date(timestamp)
  const tahun = date.getFullYear()
  const bulan = date.getMonth() + 1
  const tanggal = date.getDate()
  const jam = String(date.getHours()).padStart(2, "0")
  const menit = String(date.getMinutes()).padStart(2, "0")

  return `${tahun}/${bulan}/${tanggal} ${jam}:${menit} (WIB)`
}

let handler = async (m, { conn }) => {
  const User = global.db.data.users[m.sender]
  const userName = User.registered ? User.name : "Please Register Now Ex: .register name|age"

  let info = `AKAZA - *MD* *_(New)_*
Hello @${m.sender.replace("@s.whatsapp.net", "")}
> Notes:
• (P) for user premium only
• (L) need limit to use 
• (R) only for owner/creator

> *Information User:*
• Name: *${userName}*
• Limit: *${User.limit}*
• Exp: *${User.exp}*
• Level: *${User.level}*
• Role: *${User.role}*
• Age: *${User.registered ? User.age : "You not registered"}*
• Registered: *${User.registered ? "✅" : "❌"}*

> *Information Script:*
• Created By: *Alxzy*
• Created With: *Nodejs*
• Version: *1.0.0*
• Website: *https://www.alxzy.xyz*
• Api: *https://npmjs.com/package/baileys*
• Price Script: *Rp 25.000*
• Buy? chat: *https://wa.me/6283899858313*

> *Information Bot:*
• Date: *${formatWaktu(Date.now())}*
• Uptime: *${fuptime(getTotalUptime())}*
• Total User: *${Object.keys(global.db.data.users).length}*
• Owners: @${global.owner[0]}

> *All Features Bot:*
`

  const tagMap = await tags()
  const commandList = formatCommandList(tagMap)

  const text = info + "\n" + commandList
  await conn.sendMessage(m.chat, {
    image: { url: global.thumbnail },
    caption: text.trim(),
    mimeType: "image/jpeg",
    fileName: "Akaza MD.jpeg",
    contextInfo: {
      mentionedJid: [m.sender, ...global.owner.map(k => k + "@s.whatsapp.net")],
      externalAdReply: {
        thumbnailUrl: global.thumbnail2,
        mimeType: "image/jpeg",
        title: "Akaza - md",
        body: "Akaza - md New era",
        mediaType: 1,
        sourceUrl: "https://www.alxzy.xyz",
        renderLargerThumbnail: true
      }
    }
  })
}

handler.command = ["menu"]
handler.tags = ["main"]

export default handler
