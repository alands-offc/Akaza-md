export const before = async (m) => {
  let user = global.db.data.users[m.sender];

  if (user.afk > -1) {
    m.reply(`Kamu berhenti AFK karena: ${user.afkReason ? user.afkReason : 'Tanpa alasan'}\nSelama: ${msToTime(new Date - user.afk)}`);
    user.afk = -1;
    user.afkReason = '';
  }

  let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];

  for (let jid of jids) {
    let afkUser = global.db.data.users[jid];
    if (!afkUser || afkUser.afk < 0) continue;

    m.reply(`Jangan tag dia!\nAFK karena: ${afkUser.afkReason}\nSelama: ${msToTime(new Date - afkUser.afk)}`);
  }

  return true;
};

function msToTime(ms) {
  let d = Math.floor(ms / (1000 * 60 * 60 * 24));
  let h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  let m = Math.floor(ms / (1000 * 60)) % 60;
  let s = Math.floor(ms / 1000) % 60;

  return `${d}d ${h}h ${m}m ${s}s`;
}
