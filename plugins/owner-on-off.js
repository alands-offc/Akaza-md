let handler = async (m, { conn, args, command }) => {
  let d = db.data.chats[m.chat];

  if (!args[0]) {
    let options = Object.keys(d)
      .map((key, i) => `${i + 1}. ${key} (${d[key] ? "on" : "off"})`)
      .join('\n');
    throw `Format salah. Contoh: .${command} welcome\n\nOpsi yang tersedia:\n${options}`;
  }


  if (Object.prototype.hasOwnProperty.call(d, args[0])) {
    d[args[0]] = command === "on";
    return m.reply(`Berhasil ${command === "on" ? "mengaktifkan" : "menonaktifkan"} *${args[0]}* untuk chat ini.`);
  } else {

    let options = Object.keys(d)
      .map((key, i) => `${i + 1}. ${key} (${d[key] ? "on" : "off"})`)
      .join('\n');
    throw `Pengaturan *${args[0]}* tidak ditemukan.\n\nOpsi yang tersedia:\n${options}`;
  }
};

handler.command = ["on", "off"];
handler.tags = ["owner"];
handler.owner = true;

export default handler;
