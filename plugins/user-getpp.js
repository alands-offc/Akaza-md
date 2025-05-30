import fetch from "node-fetch";
import fs from "fs"
let handler = async (m, {conn, text, args}) => {
  let opt;
  let pp
  let orang
  if (text.includes("@")) {
  let t = text.split("@")[1] 
  if (!(await conn.onWhatsApp(t))) throw `nomor ${t} tidak terdaftar di whatsapp`
  orang = t + "@s.whatsapp.net"
  try {
    pp = await (await fetch(await conn.profilePictureUrl(orang, "image"))).buffer()
  } catch (e) {
    pp = await fs.readFileSync("./src/avatar_contact.png")
  }
} else if (m.quoted && !text.includes("@")) {
  orang = m.quoted.sender
   try {
    pp = await (await fetch(await conn.profilePictureUrl(orang, "image"))).buffer()
  } catch (e) {
    pp = await fs.readFileSync("./src/avatar_contact.png")
  }
} else if (m && !text.includes("@") && !m.quoted) {
  orang = m.sender
  try {
    pp = await (await fetch(await conn.profilePictureUrl(orang, "image"))).buffer()
  } catch (e) {
    pp = await fs.readFileSync("./src/avatar_contact.png")
  }
}
try {
await conn.sendMessage(m.chat, {
  image: Buffer.from(pp),
  mimetype: "image/png",
  fileName: "Akaza - md image.png",
  caption: "berhasil mengambil pp @" + orang.split("@")[0],
  contextInfo: {
    mentionedJid: [orang]
  }
}, {quoted: m})
} catch (e) {
  m.reply("gagal mengambil pp")
  console.error(e)
}
}
handler.tags = ["fun", "user"]
handler.command = ["getpp"]
handler.register = true
export default handler