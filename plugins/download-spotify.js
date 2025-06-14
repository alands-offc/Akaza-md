import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) throw "Masukkan judul lagu atau link track Spotify.";

  let datas = {
    image: "",
    author: "",
    name: "",
    url: "",
    album: "",
    release_date: ""
  };

  if (text.startsWith("https://")) {
    datas.url = text;
  } else {
    try {
      let searchUrl = `https://www.alxzy.xyz/api/spotify-search?limit=3&text=${encodeURIComponent(text)}`;
      let track = await (await fetch(searchUrl)).json();

      if (!track?.results || track.results.length === 0) throw "Lagu tidak ditemukan.";

      let selected = track.results[Math.floor(Math.random() * track.results.length)];
      datas = selected;
    } catch (err) {
      console.error("Error saat pencarian Spotify:", err.message);
      throw "Gagal mencari lagu di Spotify.";
    }
  }

  const audioUrl = await down(datas.url, datas.name);
  if (!audioUrl) throw "Gagal mendapatkan link audio.";

  await conn.sendMessage(m.chat, {
    audio: { url: audioUrl },
    mimetype: "audio/mpeg",
    fileName: `${datas.name || "Spotify"} - ${datas.author || "Unknown"}.mp3`,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        thumbnailUrl: datas.image || "https://i.scdn.co/image/ab67616d0000b273b503cdb444b28826c4ca9217",
        mimeType: "image/jpeg",
        renderLargerThumbnail: true,
        mediaType: 1,
        title: datas.author || "Spotify",
        body: "Akaza - md play " + (datas.name || "Lagu"),
        sourceUrl: datas.url || ""
      }
    }
  }, { quoted: m });
};

handler.command = ["spotify", "play"];
handler.tags = ["downloader"];
handler.limit = 2;
handler.register = true;
export default handler;

async function down(spotifyUrl, name) {
  try {
    const apiUrl = `https://www.alxzy.xyz/api/spotify-download?url=${encodeURIComponent(spotifyUrl)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (json?.status && json.results) {
      return json.results;
    } else {
      throw new Error("API tidak mengembalikan link download.");
    }
  } catch (err) {
    console.error("Gagal download dari Alxzy API:", err.message);
    throw new Error("Gagal mendapatkan file audio.");
  }
}