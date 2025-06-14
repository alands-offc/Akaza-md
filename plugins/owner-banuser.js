let handler = async (m, { conn, text }) => {
  let who = (m.group && text.includes("@")) 
    ? text.split("@")[1].trim() + "@s.whatsapp.net" 
    : m?.quoted?.sender || false;

  if (!who) throw "Tag atau reply ke user yang mau di-ban.";

  if (typeof db.data.users[who] !== 'object') {
    db.data.users[who] = {};
  }

  db.data.users[who].banned = true;
  await m.reply("Berhasil memasukkan user ke dalam daftar ban.");
};

handler.tags = ["owner", "user"];
handler.command = ["banuser"];
handler.owner = true;

export default handler;
