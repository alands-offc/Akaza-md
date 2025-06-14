import fetch from "node-fetch"; 
let handler = async (m, { conn, text }) => {
  if (!text) throw "contoh .brat oi"
  let api = `https://www.apis-anomaki.zone.id/tools/sticker-brat?text=${encodeURIComponent(text)}`
  let data = await (await fetch(api)).json()
  let media = await (await fetch(data.result.url)).buffer()
  let stiker = await sticker.imageToSticker(media)
 try {
   await conn.sendMessage(m.chat, {
     sticker: stiker,
     fileName: "Akaza-md sticker.webp",
     mimeType: "image/webp"
   }, { quoted: m })
 } catch (e) {
   throw e.message
 }
}
handler.help = ["brat <text>"]
handler.command = ["brat", "bratgen"]
handler.limit = 3 
export default handler