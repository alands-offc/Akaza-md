let handler = async (m, { conn }) => {
  let user = db.data.users[m.sender];
  const now = Date.now();
  const cooldown = 86400000; 
  const last = user.lastclaim || 0;

  if (now - last < cooldown) {
    let remaining = cooldown - (now - last);
    let hours = Math.floor(remaining / (1000 * 60 * 60));
    let minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    throw `Kamu sudah claim limit harian hari ini!\nSilakan coba lagi dalam *${hours} jam ${minutes} menit*.`;
  }

  user.limit += claim.limit;
  user.exp += claim.exp;
  user.lastclaim = now;

  m.reply(
    `*Klaim harian berhasil!*\n\n` +
    `+${claim.limit} Limit\n` +
    `+${claim.exp} Exp\n\n` +
    `Jangan lupa kembali besok untuk klaim lagi ya!`
  );
};

handler.command = ["claim"];
handler.tags = ["user", "fun"];
export default handler;
