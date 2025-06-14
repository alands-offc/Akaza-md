import fs from "fs";
import fetch from "node-fetch";
let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [atas, bawah] = text.split`|`
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw `balas gambar dengan perintah\n\n${usedPrefix + command} <${atas ? atas : 'teks atas'}>|<${bawah ? bawah : 'teks bawah'}>`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Mime ${mime} tidak didukung!*_`
    let img = await q.download()
    let url = await scraper.uploadPomf(img)
    let meme = `https://api.memegen.link/images/custom/${encodeURIComponent(atas ? atas : '')}/${encodeURIComponent(bawah ? bawah : '')}.png?background=${url}`;
    
    const memeBuffer = await (await fetch(meme)).buffer();
    let stiker = await sticker.imageToSticker(memeBuffer);
     try {
       await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
     } catch (e) {
       throw e.message
     }
}

handler.help = ['smeme <atas>|<bawah>']
handler.tags = ['sticker', 'tools']
handler.command = ["smeme"]

export default handler
