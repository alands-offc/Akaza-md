let handler = async (m, { conn, isPrems }) => {
  let user = db.data.users[m.sender];

  let profileText = `
Hi @${m.sender.split("@")[0]}
Berikut adalah profilmu:

• Nama: *${user.name || "Belum diatur"}*
• Limit: *${user.limit}*
• EXP: *${user.exp}*
• Last Claim: *${user.lastclaim > 1 ? "Sudah klaim hari ini" : "Belum klaim, ayo klaim sekarang!"}*
• Premium: *${isPrems ? "✅" : "❌"}*
• Status: *${user.registered ? "Teregistrasi ✅" : "Belum terdaftar ❌ (ketik .daftar)"}* ${user.registered? `\n• Register time:${formatWaktu(user.regTime)}` : ""}
• Total Command Dipakai: *${user.command || 0}*
  `.trim();

  try {
    await m.reply(profileText, {
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: global.externalR,
      }
    });
  } catch (e) {
    console.error(e);
    m.reply(profileText);
  }
};
function formatWaktu(timestamp = Date.now()) {
  const date = new Date(timestamp)
  const tahun = date.getFullYear()
  const bulan = date.getMonth() + 1
  const tanggal = date.getDate()
  const jam = String(date.getHours()).padStart(2, "0")
  const menit = String(date.getMinutes()).padStart(2, "0")

  return `${tahun}/${bulan}/${tanggal} ${jam}:${menit} (WIB)`
}
handler.command = ["profile", "me"];
handler.tags = ["user", "fun"];
handler.exp = 10;
export default handler;
