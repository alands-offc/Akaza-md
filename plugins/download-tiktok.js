import fetch from "node-fetch";
let handler = async (m, { conn, args }) => {
  conn.tiktok = conn.tiktok || {}
  console.log(args)
  if (!regex.tiktok.test(args[0])) throw "ini bukan link tiktok"
  try {
    let dl = await (await fetch(`${alxzy}tiktok-download?url=${args[0]}`)).json()
    if (!dl.status) {
      throw "Gagal ambil video. Pastikan URL TikTok valid.";
    }

    let index = 1;
    let txt = `*Tiktok Download*\nJudul: ${dl.results.metadata.title}\nauthor: ${dl.results.metadata.author_name}\nReply pesan ini dan pilih nomor\n`;
    let result = {};
     let dll = Object.keys(dl.results.download)
    for (let key of dll) {
        txt += `${index}. ${key}\n`;
        result[key] = dl.results.download[key];
        index++;
    }


    conn.tiktok[m.chat] = [
    result,
    await m.reply(txt.trim())
    ]

  } catch (e) {
    console.error(e);
    throw "Terjadi kesalahan saat ambil video TikTok.";
  }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = ["tiktok", "tt"];
handler.register = true;
handler.limit = 2;
handler.exp = 5;
export default handler;
