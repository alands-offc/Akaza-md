import fs from "fs";
let handler = async (m, { conn, args }) => {
   if (!args[0]) throw "masukan nomor contoh 6283××××"
   let Wa = await conn.onWhatsApp(args[0])
   if (!Wa[0]) throw "Nomor tidak terdaftar mohon masukan nomor dengan benar"
   let data = JSON.parse(await fs.readFileSync("./database/owner.json")) || {}
   data.push(args[0])
  await fs.writeFileSync("./database/owner.json", JSON.stringify(data, null, 2))
  await m.reply(`Berhasil menambahkan ${args[0]} ke daftar owner baru`)
}
handler.command = ["addowner"]
handler.tags = ["owner"]
handler.owner = true 
export default handler