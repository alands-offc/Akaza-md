let handler = async (m, { conn, args }) => {
  conn.instagram ??= {}
  if (!regex.instagram.test(args[0])) throw "mana url ig nya?"
  let dl = await (await fetch(alxzy + "instagram-download?url=" + args[0])).json()
  let data = [
    {
      "img": dl.results?.["imgUrl"],
      "video": dl.results?.["videoUrl"]
    }]
  conn.instagram[m.chat] = [
    data,
    await m.reply(`*Instagram Downloader*\nBalas pesan ini dan pilih nomor\n\n 1. img\n 2. video`, { contextInfo: { externalAdReply: externalR }})
    ]
}
handler.tags = ["downloader"]
handler.limit = 3;
handler.command = ["instagram", "ig"]
export default handler