let handler = async (m, { conn }) => {
  let chats = db.data.chats[m.chat]
  if (!chats.isBanned) throw "chat ini tidak terbanned"
  chats.isBanned = false
  await m.reply("berhasil membuka akses ke chat ini")
}
handler.command = ["unbanchat", "ubnc"]
handler.tags = ["owner"]
handler.owner = true;
export default handler
