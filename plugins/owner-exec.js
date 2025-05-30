import { execSync } from "child_process";
import util from "util";
let handler = async (m, {text}) => {
 let data = execSync(text)
 m.reply(data.toString())
}
handler.command = ["$"] 
handler.owner = true
handler.prefix = false
handler.tags = ["owner", "advanced"]
export default handler