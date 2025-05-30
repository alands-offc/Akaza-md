import makeWaSocket, {
    areJidsSameUser,
    Browsers,
    delay,
    downloadContentFromMessage,
    downloadMediaMessage,
    extractMessageContent,
    fetchLatestWaWebVersion,
    generateForwardMessageContent,
    generateWAMessage,
    generateWAMessageContent,
    generateWAMessageFromContent,
    getAggregateVotesInPollMessage,
    getContentType,
    jidDecode,
    jidNormalizedUser,
    makeCacheableSignalKeyStore
} from "baileys";
import pkg from "baileys";
const { generateMessageTag, relayWAMessage, InteractiveMessage, proto } = pkg;
import chalk from "chalk";
import { format } from "util";
import pino from "pino";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prefix = ["."]
/**  
 * @typedef {import("baileys")} Baileys  
 * @typedef {Object} conn - Objek utama yang menangani komunikasi dengan WhatsApp
 * @property {Function} sendMessage - Fungsi untuk mengirim pesan
 */

/**  
 * Fungsi untuk menambahkan fitur tambahan ke objek WhatsApp (conn)
 * @param {conn} conn - Objek utama untuk komunikasi WhatsApp  
 * @param {any} m - Data pesan  
 * @returns {string|Object} - Pesan error jika `conn` tidak ditemukan, atau objek yang telah diperbarui  
 */
function simple(opts) {
   const conn = makeWaSocket.default(opts);
    let sock = Object.defineProperties(conn, {
        chats: {
            value: {},
            writable: true
        },
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== "string") return jid || null;
                return jidDecode(jid);
            }
        },
        logger: {
            get() {
                return {
                    info(...args) {
                        console.log(
                            chalk.bold.bgGreen("INFO "),
                            `[${chalk.white(new Date().toUTCString())}]:`,
                            chalk.cyan(format(...args))
                        );
                    },
                    error(...args) {
                        console.log(
                            chalk.bold.bgRed("ERROR "),
                            `[${chalk.white(new Date().toUTCString())}]:`,
                            chalk.red(format(...args))
                        );
                    },
                    warn(...args) {
                        console.log(
                            chalk.bold.bgYellow("WARNING "),
                            `[${chalk.white(new Date().toUTCString())}]:`,
                            chalk.yellow(format(...args))
                        );
                    },
                    trace(...args) {
                        console.log(
                            chalk.grey("TRACE "),
                            `[${chalk.white(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        );
                    },
                    debug(...args) {
                        console.log(
                            chalk.bold.bgBlue("DEBUG "),
                            `[${chalk.white(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        );
                    }
                };
            },
            enumerable: true
        },
        reply: {
            async value(Jid, text, opts = {}, type) {
                let opt = {};

                if (Buffer.isBuffer(text)) {
                    if (type === "video") opt = { video: text.includes("http") ? { url: text } : text, mimeType: "video/mp4", fileName: "video.mp4" };
                    if (type === "audio") opt = { audio: text.includes("http") ? { url: text } : text, mimeType: "audio/mp3", fileName: "audio.mp3" };
                    if (type === "image") opt = { image: text.includes("http") ? { url: text } : text, mimeType: "image/png", fileName: "image.png" };
                    return conn.sendMessage(Jid, opt, opts, { quoted: q});
                } else {
                    return conn.sendMessage(Jid, { text: text }, opts, { quoted: q});
                }
            },
            enumerable: true
        },
      download: {
        async value(message)  {
        let buffer = await downloadMediaMessage(
            message,
            'buffer', {}, {
            logger: pino({ level: 'silent' }),
            reuploadRequest: conn.updateMediaMessage
        }
        )
        return buffer
    },
    enumerable: true
      },
       smsg: {
  async value(m) {
    function getText(message) {
      let data;
        data =
          message?.text ||
          message?.conversation ||
          message?.caption ||
          message?.selectedButtonId ||
          message?.singleSelectReply?.selectedRowId ||
          message?.selectedId ||
          message?.contentText ||
          message?.selectedDisplayText ||
          message?.title ||
          message?.name ||
          "";
      return data;
    }

    function parseMessage(content) {
      content = extractMessageContent(content);

      if (content?.viewOnceMessageV2Extension) {
        content = content.viewOnceMessageV2Extension.message;
      }
      if (content?.ephemeralMessage) {
        content = content.ephemeralMessage.message;
      }
      if (content?.protocolMessage?.type === 14) {
        let type = getContentType(content.protocolMessage);
        content = content.protocolMessage[type];
      }
      if (content?.message) {
        let type = getContentType(content.message);
        content = content.message[type];
      }

      return content;
    }

    function escapeRegExp(string) {
      return string.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, "\\$&");
    }

    if (!m) return false;

    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.name = m.pushName;
    m.fromMe = m.key.fromMe;
    m.sender = m.fromMe
      ? jidNormalizedUser(conn.user.id)
      : m.chat.includes(`@s.whatsapp.net`)
      ? m.chat
      : m.key.participant;

    if (m.message) {
      m.message = parseMessage(m.message);
      m.type =
        Object.keys(m.message).find(
          (a) =>
            (a.includes("conver") ||
              (!a.includes("senderKeyDistributionMessage") &&
                a.endsWith("Message")) ||
              a.includes("V3"))
        ) || Object.keys(m.message)[0] || "";

      m.msg = m.message.interactiveResponseMessage
        ? m.message
        : m.message[m.type];
      m.bot = m.id.startsWith("BAE5") || (m.id.startsWith("3EB0") && m.id.length === 22);
      m.group = m.chat.endsWith("@g.us");
      m.expiration = m.msg?.contextInfo?.expiration || 0;
      m.viewOnce = !!m.msg?.viewOnce;

      if (m.group) {
        m.metadata = await conn.groupMetadata(m.chat);
        m.gcname = m.metadata.subject;
        m.participants = m.metadata.participants;
        m.isGroupOwner = m.metadata.owner;
        m.admin = m.metadata.participants
          .filter((a) => a.admin === "admin" || a.admin === "superadmin")
          .map((a) => a.id);
        m.isAdmin = m.admin.includes(m.sender);
        m.isBotAdmin = m.admin.includes(jidNormalizedUser(conn.user?.id));
      }

      m.text = getText(m.msg) || m.message?.conversation;
        m.prefix = new RegExp(`^[${prefix.join("")}^]`, "gi").test(m.text)
        ? m.text.match(new RegExp(`^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]`, "gi"))[0]
        : "";
        m.command = m.text
        ?.trim()
        .replace(m.prefix, "")
        .trim()
        .split(/ +/)
        .shift();
      m.args =
        m.text
          ?.trim()
          .replace(new RegExp("^" + escapeRegExp(m.prefix), "i"), "")
          .replace(m.command, "")
          .split(/ +/)
          .filter((a) => a) || [];
      m.mentionedJid = m.msg.contextInfo?.mentionedJid || [];
      m.download = async () => {
        return await conn.download(m)
      }
      if (m.msg?.contextInfo?.quotedMessage) {
        m.quoted = {
          key: {
            remoteJid: m.chat,
            id: m.msg.contextInfo?.stanzaId,
            fromMe: m.msg.contextInfo?.participant.includes(
              jidNormalizedUser(conn.user?.id)
            ),
            participant: m.msg.contextInfo.participant,
          },
          chat: m.chat,
          sender: m.msg.contextInfo?.participant.includes(
            jidNormalizedUser(conn.user?.id)
          )
            ? jidNormalizedUser(conn.user.id)
            : m.msg.contextInfo.participant || m.chat,
          id: m.msg.contextInfo?.stanzaId,
          fromMe: m.msg.contextInfo?.participant.includes(
            jidNormalizedUser(conn.user?.id)
          ),
          message: parseMessage(m.msg.contextInfo?.quotedMessage),
        };

        m.quoted.type = Object.keys(m.quoted.message).find(
          (a) =>
            a.includes("conver") ||
            a.endsWith("Message") ||
            a.includes("V3") ||
            (!a.includes("senderKeyDistributionMessage") && a.includes("V3"))
        );
        m.quoted.msg = m.quoted.message[m.quoted.type];
        m.quoted.mentionedJid = m.msg.contextInfo?.mentionedJid || [];
        m.quoted.group = m.quoted.chat.endsWith("@g.us");
        m.quoted.viewOnce = !!m.quoted?.msg?.viewOnce;
        m.quoted.bot =
          m.quoted?.id?.includes("BAE5") ||
          m.quoted?.id.startsWith("3EB0");
        m.quoted.text = getText(m.quoted.msg) || m.quoted.message.conversation;
                m.quoted.prefix = new RegExp(`^[${prefix.join("")}^]`, "gi").test(
          m.quoted.text
        )
          ? m.quoted.text.match(
              new RegExp(`^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]`, "gi")
            )[0]
          : "";
        m.quoted.command = m.quoted.text
          ?.trim()
          .replace(m.quoted.prefix, "")
          .trim()
          .split(/ +/)
          .shift();
        m.quoted.args =
          m.quoted.text
            ?.trim()
            .replace(new RegExp("^" + escapeRegExp(m.quoted.prefix), "i"), "")
            .replace(m.quoted.command, "")
            .split(/ +/)
            .filter((a) => a) || [];
        m.quoted.res = m.quoted.args.join(" ").trim();
        m.quoted.download = async () => {
        return await conn.download(m.quoted)
      }
      }
      m.reply = async (text, options = {}) => {
        if (typeof text === "string") {
          return await conn.sendMessage(
            m.chat,
            { text, ...options },
            { quoted: m, ephemeralExpiration: m.expiration, ...options }
          );
        } else if (typeof text === "object") {
          return conn.sendMessage(
            m.chat,
            { ...text, ...options },
            { quoted: m, ephemeralExpiration: m.expiration, ...options }
          );
        }
      };

      m.wait = async () => await m.reply("bentar");
    }

    return m;
  },
  enumerable: true,
  configurable: true,
  writable: true,
}

    });

    return sock;
}
function protoType() {
  Array.prototype.getRandom = function getRandom() {
    return this[Math.floor(Math.random() * this.length)];
  };
   Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
  return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
};
}
export { simple, protoType }