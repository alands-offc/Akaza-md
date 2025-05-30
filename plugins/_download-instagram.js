export const before = async (m, {conn}) => {
  
  let ig = conn.instagram?.[m.chat]
  if (!ig) return true 
  if (!m.quoted) return true 
  if (!(m.quoted.key.id === ig[1].key.id)) return true 
  let options = ["1", "2"]
  if (!(options.includes(m.text))) return m.reply("pilih opsi antara 1/2")
  if (m.text === "1") {
    var url = ig[0][0]["img"]
    await conn.sendMessage(m.chat, {
      image: { url: url },
      caption: "ini fotonya kak",
      mimeType: "image/png",
      fileName: "Akaza - md image.png",
        contextInfo: {
        externalAdReply: externalR
      }
      }, { quoted: m })
     await conn.sendMessage(m.chat, {delete: ig[1].key})
     delete conn.instagram[m.chat]
     return true
  } else if (m.text === "2") {
    var url = ig[0][0]["video"]
    await conn.sendMessage(m.chat, {
      video: { url: url },
      caption: "ini videonya kak",
      mimeType: "video/mp4",
      fileName: "Akaza - md video.mp4",
        contextInfo: {
        externalAdReply: externalR
      }
      }, { quoted: m })
      await conn.sendMessage(m.chat, {delete: ig[1].key})
     delete conn.instagram[m.chat]
     return true
  }
  return false
}