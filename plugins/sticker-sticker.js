import util from "util";
import fs from "fs";
let handler = async (m, { conn }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q.message).mimetype
  if (/image/g.test(mime)) {
    let buffer = await q.download();
    let image = await sticker.imageToSticker(buffer)
    try {
      await conn.sendMessage(m.chat, { sticker: image }, { quoted: m });
    } catch (e) {
      await m.reply(util.format(e));
    }
  } else if (/video/g.test(mime)) {
    let buffer = await q.download();
    let video = await fs.readFileSync(await sticker.videoToSticker(buffer));
    try {
      await conn.sendMessage(m.chat, { sticker: video }, { quoted: m })
    } catch (e) {
      await m.reply(util.format(e))
    }
  } else {
    m.reply("Tolong balas pesan image/video")
  }
}
handler.command = ["sticker", "s"];
handler.tags = ["tools"];
handler.help = ["s <balas|kirim foto"]
handler.register = true
handler.limit = 5;
export default handler