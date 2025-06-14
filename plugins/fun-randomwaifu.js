//https://api.waifu.pics/sfw/waifu
import fetch from "node-fetch"
let handler = async (m, {conn}) => {
  await conn.sendMessage(m.chat, {
    image: { url: (await (await fetch("https://api.waifu.pics/sfw/waifu")).json()).url },
    mimeType: "image/png",
    fileName: "Akaza - md waifu.png",
    caption: `@${m.sender.split("@")[0]}`,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: externalR
    }
  }, { quoted: m })
}
handler.help = handler.command = ["waifu"]
handler.limit = 1 
export default handler