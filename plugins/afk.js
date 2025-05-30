let handler = async (m, { conn, text }) => {
 let user = global.db.data.users[m.sender] 
 let date = Date.now() 
 user.afk = date;
 user.afkReason = text? text : "No reason";
 conn.sendMessage(m.chat, {
   text: `@${m.sender.replace("@s.whatsapp.net", "")} is now afk\n Reason: ${user.afkReason}`,
 contextInfo: {
   mentionedJid: [m.sender],
   externalAdReply: global.externalr
 }
 }, { quoted: m})
}
handler.command = ["afk"];
handler.tags = ["fun"]
export default handler