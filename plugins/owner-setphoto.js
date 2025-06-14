import { jidNormalizedUser } from "baileys";

let handler = async (m, { conn, text, isBotAdmin }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.message || q).mimetype || "";
  let who;
  if (!text) return m.reply("Masukkan `bot` atau ID grup yang ingin diubah foto profilnya.");

  if (text.includes("bot")) {
    who = jidNormalizedUser(conn.user.id);
  } else if (text.endsWith("@g.us")) {
    who = text.trim();
  } else {
    return m.reply("Masukkan `bot` atau ID grup dengan format yang benar.");
  }

  if (/image\/(jpeg|png)/g.test(mime)) return m.reply("Balas/kirim dengan gambar yang ingin dijadikan foto profil.");

  const media = await q.download();

  if (who.endsWith("@g.us") && !isBotAdmin) return m.reply("Bot harus menjadi admin untuk mengubah foto profil grup.");

  try {
    await conn.updateProfilePicture(who, { buffer: (await conn.generateProfilePicture(media)).img});
    m.reply("Berhasil mengubah foto profil.");
  } catch (err) {
    console.error(err);
    m.reply("Gagal mengubah foto profil.");
  }
};

handler.tags = ["owner"];
handler.command = ["setpp", "setphoto"];
handler.owner = true;

export default handler;
