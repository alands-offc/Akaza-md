let handler = async (m, { conn, text, command }) => {
  text.trim();
  let d = db.data.chats[m.chat]
  if (!text) throw "Format salah Contoh .on welcome\nList on-off\n1. welcome";
  if (command === "on" && d[text]) {
    d[text] = true
  } else if (command === "off" && d[text]) {
    d[text] = false 
  } else {
    throw `${text} tidak ada`
  }
  return m.reply(`berhasil ${command === "on"? "mengaktifkan" : "menonaktifkan"} ${text} untuk chat ini`)
}
handler.command = ["on", "off"]
handler.tags = ["owner"]
handler.owner = true 
export default handler