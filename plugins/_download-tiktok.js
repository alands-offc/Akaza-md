export const before = async (m, { conn }) => {
  if (!m.quoted) return true;

  if (m.quoted.key.id !== conn.tiktok?.[m.chat]?.[1]?.key?.id) return true;

  let data = conn.tiktok[m.chat][0];
  let index = toIndex(m.text);
  if (index === -1) return;

  let keys = Object.keys(data);
  if (index >= keys.length) return;

  let key = keys[index];
  let download = {
    url: data[key],
    type: key.split("_")[0] 
  };

  let options = {
      mentionedJid: [m.sender],
      externalAdReply: global.externalR
  };

  if (download.type === "video") {
    await conn.sendMessage(m.chat, {
      video: { url: download.url },
      mimeType: "video/mp4",
      fileName: "Akaza - md Tiktok.mp4",
      caption: `ini videonya kak @${m.sender.replace("@s.whatsapp.net", "")}`,
      contextInfo: options
    }, { quoted: m });
    await conn.sendMessage(m.chat, { delete: conn.tiktok[m.chat][1].key })
    delete conn.tiktok[m.chat]
  } else if (download.type === "image") {
    await conn.sendMessage(m.chat, {
      image: { url: download.url },
      mimeType: "image/png",
      fileName: "Akaza - md image.png",
      caption: "nih kah fotonya",
    contextInfo: options
    }, { quoted: m });
    await conn.sendMessage(m.chat, { delete: conn.tiktok[m.chat][1].key })
  } else if (download.type === "audio") {
    await conn.sendMessage(m.chat, {
      audio: { url: download.url },
      mimeType: "audio/mp4",
      fileName: "Akaza - md audio.mp3",
      contextInfo:options
    }, { quoted: m });
    await conn.sendMessage(m.chat, { delete: conn.tiktok[m.chat][1].key })
    delete conn.tiktok[m.chat]
  }
  
  return true;
};

function toIndex(text) {
  let i = parseInt(text);
  if (isNaN(i) || i < 1) return -1;
  return i - 1;
}
