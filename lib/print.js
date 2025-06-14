import chalk from "chalk";
import PhoneNumber from "awesome-phonenumber";

// Helper
const getNumber = (jid) => {
  const num = jid?.split("@")[0];
  const pn = new PhoneNumber("+" + num);
  return pn.isValid() ? pn.getNumber("international") : "+" + num;
};

const isURL = (text) => /(https?:\/\/[^\s]+)/gi.test(text);
const isJSON = (text) => {
  try {
    return typeof text === "string" && JSON.parse(text);
  } catch {
    return false;
  }
};

export default function logMessageSimple(conn, m) {
  const waktu = new Date(m.messageTimestamp * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const type = m.type?.replace("Message", "") || "unknown";
  const nama = m.name || m.pushName || "Anonim";
  const sender = getNumber(m.sender);
  const chat = m.chat || "-";

  const log = console.log;
  const line = chalk.gray("=".repeat(45));

  log(line);
  log(`${chalk.greenBright("[MESSAGE]")} ${chalk.white(waktu)}`);
  log(`👤 ${chalk.cyan("Name")}     : ${nama}`);
  log(`📱 ${chalk.cyan("Sender")}   : ${sender}`);
  log(`💬 ${chalk.cyan("Type")}     : ${type}`);
  if (m.command) log(`⚙️  ${chalk.cyan("Command")}  : ${m.command}`);
  if (m.args?.length) log(`🧩 ${chalk.cyan("Args")}     : ${m.args.join(" | ")}`);
  if (m.text) {
    const isJson = isJSON(m.text);
    const label = isJson ? "JSON" : "Text";
    const content = isJson ? JSON.stringify(JSON.parse(m.text), null, 2) : m.text;
    log(`📝 ${chalk.cyan(label)}     : ${content}`);
    if (isURL(m.text)) log(chalk.redBright("🔗 URL Detected!"));
  }
  if (["image", "video", "document", "sticker"].includes(type.toLowerCase())) {
    if (m.mimetype) log(`📎 ${chalk.cyan("Mimetype")} : ${m.mimetype}`);
  }
  if (m.quoted) {
    log(`↪️  ${chalk.cyan("Replying")} : ${getNumber(m.quoted.sender)}`);
    if (m.quoted.text) log(`💬 ${chalk.cyan("Quoted")}  : ${m.quoted.text}`);
  }
  log(line);
}
