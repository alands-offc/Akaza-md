let handler = async (m, { conn }) => {
  let q = m.quoted? m.quoted : m 
  let mime = (q.msg || q.message).mimetype
  if (/image/g.test(mime)) {
    let media = await q.download()
    let file = await scraper.Upload(media, `${Date.now() + "." + mime.split("/")[1]}`)
    let text = `*Upload Berhasil*\ntype: *${mime}*\nurl: *${file}*\nexpired: *no expired*`
    m.reply(text)
  } else {
    m.reply("reply foto kak")
  }
}
handler.command = ["tourl"]
handler.tags = ["tools"]
handler.limit = 2;
export default handler