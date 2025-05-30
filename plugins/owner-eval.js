import util from "util";
import fetch from "node-fetch";
import fs from "fs";
import axios from "axios";
let handler = async (m, { conn, text, args}) => {
  let ev = `(async() => { ${text} })()`;
  let execs = eval(ev).then(k => m.reply(util.format(k))).catch(e => m.reply(util.format(e)))
}
handler.tags = ["owner", "advanced"]
handler.owner = true 
//handler.customPrefix = []
handler.command = [">"]
handler.prefix = 'optional'
export default handler