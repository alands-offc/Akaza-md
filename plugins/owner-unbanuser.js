let handler = async (m, { conn, text }) => {
  let who = (m.group && text.includes("@")) 
    ? text.split("@")[1].trim() + "@s.whatsapp.net" 
    : m?.quoted?.sender || false;

  if (!who) throw "Tag atau reply ke user yang mau di-unban.";

  if (typeof db.data.users[who] !== 'object') {
    db.data.users[who] = {};
  }

  db.data.users[who].banned = false;
  await m.reply("Berhasil mengeluarkan user dari daftar ban.");
};

handler.tags = ["owner"];
handler.command = ["unbanuser"];
handler.owner = true;

export default handler;
