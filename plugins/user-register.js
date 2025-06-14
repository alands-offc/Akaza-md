let handler = async (m, { conn, text, command }) => {
  let user = db.data.users[m.sender];

  if (user.registered) throw "Kamu sudah terdaftar sebelumnya.";

  if (!text.includes("|")) throw `Format salah!\nContoh: *.${command} Nama|Umur*`;

  let [nama, umur] = text.split("|").map(v => v.trim());

  if (!nama || !umur) throw `Nama dan umur tidak boleh kosong!\nContoh: *.${command} Nama|Umur*`;

  umur = parseInt(umur);
  if (isNaN(umur)) throw "Umur harus berupa angka.";

  if (umur < 5) throw "Masih bocil dah main HP?🗿";
  if (umur > 60) throw "Udah tua bukannya istirahat malah main HP?🗿";

  user.registered = true;
  user.name = nama;
  user.age = umur;
  user.regTime = Date.now()
  return m.reply(
    `*Pendaftaran Berhasil!*\n\n` +
    `• Nama: *${nama}*\n` +
    `• Umur: *${umur} tahun*\n` +
    `• Status: *Teregistrasi*\n\n` +
    `Selamat datang di Akaza - md, kak!`
  );
};

handler.command = ["daftar","register"];
handler.tags = ["user", "main"];
handler.help = ["daftar <nama|umur>"]
export default handler;
