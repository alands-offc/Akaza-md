import { delay } from "baileys"
let handler = async (m, { conn, text }) => {
  if (!text) throw "Text apa yang mau di bagikan ke semua grub anda?"
  let listGrup = await conn.groupFetchAllParticipating();
  let Group = Object.keys(listGrup)
  let textbc = `*Akaza - md Broadcast*\n*Dari:* @${m.sender.split("@")[0]}\n*Pesan:* ${text.trim()}\n*________End Of Broadcast________*`
  for (let id of Group) {
    await delay(5000)
    await conn.sendMessage(id, {
      text: textbc,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: externalR
      }
      }, { quoted: m })
  }
}
handler.command = ["broadcast", "bc"]
handler.tags = ["owner", "group"]
handler.owner = true;
export default handler