import fs from "fs";

let handler = async (m, { conn, text }) => {
  let qtext = m.quoted ? m.quoted.text : false;

  if (!qtext || !text.includes(".js")) {
    throw "Reply dengan kode JavaScript dan sertakan nama file. Contoh: .addplugin owner-owner.js (reply kode kamu)";
  }

  fs.writeFileSync("./plugins/" + text, qtext);
  await m.reply("Berhasil menambahkan plugin!", {
    contextInfo: { externalAdReply: externalR }
  });
};

handler.command = ["addplugin", "addplugins"];
handler.tags = ["owner"];
handler.owner = true;

export default handler;
