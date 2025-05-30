import chalk from "chalk";
import cfonts from "cfonts";

// Helper Functions
const isURL = (text) => /(https?:\/\/[^\s]+)/gi.test(text);
const awesomePhone = (jid) => jid?.replace(/@s\.whatsapp\.net$/, "") || "";
const isJSON = (text) => {
  try {
    return typeof text === 'string' && JSON.parse(text);
  } catch {
    return false;
  }
};

const bgLine = chalk.bgRgb(30, 30, 30).white("─".repeat(50));
const label = (text, bg = 'bgCyan', color = 'white') => chalk[bg][color](` ${text} `);

// Main Export
export default async function (conn, m) {
  const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const nama = m.name || m.pushName || "Anonim";
  const type = m.type?.includes("Message") ? m.type.replace("Message", "") : m.type;

  // Title Display
  cfonts.say('NEW MESSAGE', {
    font: 'block',
    align: 'center',
    colors: ['blue', 'magenta'],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '20',
  });

  console.log(chalk.bgGreenBright.black(`[ ${type.toUpperCase()} Message Detected - ${waktu} ]`));
  console.log(bgLine);

  // Basic Info
  console.log(label("Name:"), nama);
  console.log(label("From:"), awesomePhone(m.sender));
  console.log(label("Chat ID:"), m.chat);
  console.log(label("Type:"), `${type} Message`);

  // If media message
  if (["image", "video", "document", "sticker"].includes(type.toLowerCase())) {
    if (m.mimetype) console.log(label("Mimetype:", 'bgMagenta'), m.mimetype);
    if (m.text) {
      const isJson = isJSON(m.text);
      const labelText = isJson ? "JSON:" : "Caption:";
      console.log(label(labelText, 'bgYellow'), isJson ? JSON.stringify(JSON.parse(m.text), null, 2) : m.text);
      if (isURL(m.text)) console.log(chalk.redBright("⚠️  URL Detected!"));
    }
  } else {
    // Text-based message
    const isJson = isJSON(m.text);
    const labelText = isJson ? "JSON:" : "Text:";
    console.log(label(labelText, 'bgBlue'), isJson ? JSON.stringify(JSON.parse(m.text), null, 2) : m.text);
    if (isURL(m.text)) console.log(chalk.redBright("⚠️  URL Detected!"));
    if (m.command) console.log(label("Command:", 'bgCyan'), m.command);
    if (m.args?.length) console.log(label("Args:", 'bgWhite', 'black'), m.args.join(" | "));
  }

  // Quoted message
  if (m.quoted) {
    console.log(label("Replying", 'bgGray'), awesomePhone(m.quoted.sender));
//    console.log(label("Quoted Text:", 'bgGray'), m.quoted.text || m.quoted.msg);
  }

  console.log(bgLine);
}
