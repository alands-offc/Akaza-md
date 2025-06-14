import fetch from "node-fetch";
import fs from "fs";

let handler = async (m, { conn, text, args }) => {
  let pp;
  let orang;

  if (text.includes("@")) {
    const t = text.split("@")[1];
    if (!(await conn.onWhatsApp(t))) {
      throw `Nomor ${t} tidak terdaftar di WhatsApp`;
    }
    orang = t + "@s.whatsapp.net";
  } else if (m.quoted) {
    orang = m.quoted.sender;
  } else {
    orang = m.sender;
  }

  try {
    pp = await (await fetch(await conn.profilePictureUrl(orang, "image"))).buffer();
  } catch (e) {
    pp = fs.readFileSync("./src/avatar_contact.png");
  }

  try {
    await conn.sendMessage(
      m.chat,
      {
        image: Buffer.from(pp),
        mimetype: "image/png",
        fileName: "Akaza - md image.png",
        caption: `Berhasil mengambil PP @${orang.split("@")[0]}`,
        contextInfo: {
          mentionedJid: [orang],
        },
      },
      { quoted: m }
    );
  } catch (e) {
    m.reply("Gagal mengambil PP");
    console.error(e);
  }
};

handler.tags = ["fun", "user"];
handler.command = ["getpp"];
handler.register = true;

export default handler;
