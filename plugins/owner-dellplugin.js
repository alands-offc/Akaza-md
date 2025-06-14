import fs from "fs";
import { execSync } from "child_process";

let handler = async (m, { conn, text }) => {
  if (!text) {
    const list = execSync("ls plugins").toString();
    return await m.reply("Plugins apa yang mau kamu hapus?\n" + list);
  }

  const filePath = "plugins/" + text.trim();

  if (fs.existsSync(filePath)) {
    execSync(`rm -rf ${filePath}`);
    await m.reply(`Plugin *${text.trim()}* berhasil dihapus.`);
  } else {
    await m.reply("File tidak ditemukan!");
  }
};

handler.command = ["dellplugin", "hapusplugin"];
handler.tags = ["owner"];
handler.owner = true;

export default handler;
