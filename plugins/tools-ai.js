import axios from "axios"
let handler = async (m, { conn, text }) => {
  if (!text) throw "Masukkan teksnya";

const result = await ai(text)
 
  await m.reply(result, {
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: externalR
    }
  });
};

handler.tags = ["user", "tools"];
handler.command = ["ai"];
handler.limit = 2;

export default handler;
async function ai (text) {
      const response = await fetch(alxzy + "blackbox", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ role: "user", content: text }]),
    });
   let data = await response.json()
  return data.results.response[0].content
}