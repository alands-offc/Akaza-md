import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import { pathToFileURL } from "url"
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
  const result = {}

  for (const name in global.plugins) {
    const plugin = global.plugins[name]
    const tagList = plugin.tags || []

    let helps = plugin.help && Array.isArray(plugin.help) ? plugin.help : null
    let commands = helps || plugin.command

    if (!Array.isArray(commands)) {
      commands = commands ? [commands] : []
    }

    for (const tag of tagList) {
      if (!result[tag]) result[tag] = []

      for (const cmd of commands) {
        result[tag].push({
          command: cmd,
          file: name,
          limit: plugin.limit || false,
          premium: plugin.premium || false,
          owner: plugin.owner || false
        })
      }
    }
  }

  return result
}

function formatCommandList(tagObject) {
  let result = ""

  for (const tag in tagObject) {
    result += `╭─── ⌈  *${tag.toUpperCase()}*  ⌋ ───╮\n`

    for (const cmd of tagObject[tag]) {
      let flags = []
      if (cmd.limit) flags.push("🪙") // limit
      if (cmd.premium) flags.push("💎") // premium
      if (cmd.owner) flags.push("👑") // owner

      let flagStr = flags.length ? ` ${flags.join(" ")}` : ""
      result += `│ ✦ .${cmd.command}${flagStr}\n`
    }

    result += `╰─────────────────────╯\n\n`
  }

  return result.trim()
}

function fuptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  let parts = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (secs) parts.push(`${secs}s`)

  return parts.join(" ")
}

function formatWaktu(timestamp = Date.now()) {
  const date = new Date(timestamp)
  const tahun = date.getFullYear()
  const bulan = date.getMonth() + 1
  const tanggal = date.getDate()
  const jam = String(date.getHours()).padStart(2, "0")
  const menit = String(date.getMinutes()).padStart(2, "0")

  return `${tahun}/${bulan}/${tanggal} ${jam}:${menit} WIB`
}

let handler = async (m, { conn }) => {
  const User = global.db.data.users[m.sender]
  const userName = User.registered ? User.name : "Not Registered"
  const tagMap = await tags()

  const info = `
╭── ⌈ *AKAZA-MD MENU* ⌋ ──╮
│  📱 *User Info*
│  • Name: *${userName}*
│  • Age: *${User.age || "-"}*
│  • Level: *${User.level}*
│  • Role: *${User.role}*
│  • Exp: *${User.exp}*
│  • Limit: *${User.limit}*
│  • Registered: *${User.registered ? "✅" : "❌"}*
│
│  🤖 *Bot Info*
│  • Uptime: *${fuptime(process.uptime())}*
│  • Date: *${formatWaktu()}*
│  • Total Users: *${Object.keys(global.db.data.users).length}*
│  • Owner: @${global.owner[0]}
│
│  🧾 *Script Info*
│  • Creator: *Alxzy*
│  • Version: *1.0.0*
│  • Site: *https://www.alxzy.xyz*
│  • API: *baileys*
│
│  🛈 *Legend:*
│     • 💎 Premium
│     • 🪙 Limit
│     • 👑 Owner
╰────────────────────╯

📚 *Available Commands:*
`.trim()

  const commandList = formatCommandList(tagMap)

  await conn.sendMessage(m.chat, {
    image: { url: global.thumbnail },
    caption: info + "\n\n" + commandList,
    fileName: "Akaza MD.jpeg",
    mimeType: "image/jpeg",
    contextInfo: {
      mentionedJid: [m.sender, ...global.owner.map(k => k + "@s.whatsapp.net")],
      externalAdReply: {
        title: "Akaza-MD ✦ Menu",
        body: "Fast, Reliable, Beautiful Bot!",
        thumbnailUrl: global.thumbnail2,
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
