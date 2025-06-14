let handler = async (m, { conn }) => {
  let chats = db.data.chats[m.chat]
  if (chats.isBanned) throw "chat ini sudah terbanned"
  chats.isBanned = true
  await m.reply("berhasil membanned chat ini")
}
handler.command = ["banchat"]
handler.tags = ["owner"]
handler.owmer = true;
export default handler