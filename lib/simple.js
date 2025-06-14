await import(`../config.js?v=${Date.now()}`)
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
import store from "./store.js";
import PhoneNumber from 'awesome-phonenumber';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const sock = Object.defineProperties(conn, {
    logger: {
      get() {
        const timestamp = () => `[${chalk.white(new Date().toUTCString())}]:`;
        return {
          info: (...args) =>
            console.log(chalk.bold.bgGreen("INFO "), timestamp(), chalk.cyan(format(...args))),
          error: (...args) =>
            console.log(chalk.bold.bgRed("ERROR "), timestamp(), chalk.red(format(...args))),
          warn: (...args) =>
            console.log(chalk.bold.bgYellow("WARNING "), timestamp(), chalk.yellow(format(...args))),
          trace: (...args) =>
            console.log(chalk.grey("TRACE "), timestamp(), chalk.white(format(...args))),
          debug: (...args) =>
            console.log(chalk.bold.bgBlue("DEBUG "), timestamp(), chalk.white(format(...args))),
        };
      },
      enumerable: true,
    },

    reply: {
      async value(Jid, text, opts = {}, type) {
        let opt = {};
        if (Buffer.isBuffer(text)) {
          const isURL = text.includes?.("http");
          if (type === "video") opt = { video: isURL ? { url: text } : text, mimeType: "video/mp4", fileName: "video.mp4" };
          if (type === "audio") opt = { audio: isURL ? { url: text } : text, mimeType: "audio/mp3", fileName: "audio.mp3" };
          if (type === "image") opt = { image: isURL ? { url: text } : text, mimeType: "image/png", fileName: "image.png" };
          return conn.sendMessage(Jid, opt,  ...opts );
        } else {
          return conn.sendMessage(Jid, { text }, ...opts);
        }
      },
      enumerable: true,
    },

    decodeJid: {
      value(jid) {
        if (!jid || typeof jid !== "string") return (!isNull(jid) && jid) || null;
        return jid.decodeJid();
      },
    },

    getName: {
  value(jid = "", withoutContact = false) {
    jid = conn.decodeJid(jid);
    if (!jid || typeof jid !== "string") return "";

    withoutContact = conn.withoutContact || withoutContact;
    let v;

    if (jid.endsWith("@g.us")) {
      return new Promise(async (resolve) => {
        v = conn.chats[jid] || {};
        if (!(v.name || v.subject)) {
          try {
            v = await conn.groupMetadata(jid);
          } catch (e) {
            v = {};
          }
        }
        resolve(
          v.name ||
          v.subject ||
          PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international")
        );
      });
    }

    v = jid === "0@s.whatsapp.net"
      ? { jid, vname: "WhatsApp" }
      : areJidsSameUser(jid, conn.user.id)
        ? conn.user
        : (conn.chats[jid] || {});

    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.vname ||
      v.notify ||
      v.verifiedName ||
      PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international")
    );
  },
  enumerable: true,
},
    download: {
      async value(message) {
        return await downloadMediaMessage(message, "buffer", {}, {
          logger: pino({ level: "silent" }),
          reuploadRequest: conn.updateMediaMessage,
        });
      },
      enumerable: true,
    },

    smsg: {
      async value(m) {
        if (!m) return false;

        function getText(message) {
          if (!message) return "";
          try {
            return (
              message.text ||
              message.conversation ||
              message.caption ||
              message.selectedButtonId ||
              message.singleSelectReply?.selectedRowId ||
              message.selectedId ||
              message.contentText ||
              message.selectedDisplayText ||
              message.title ||
              message.name ||
              (message.nativeFlowResponseMessage
                ? JSON.parse(message.nativeFlowResponseMessage.paramsJson)?.id
                : "")
            );
          } catch (e) {
            console.error(e);
            return "";
          }
        }

        function parseMessage(content) {
          content = extractMessageContent(content);
          if (content?.viewOnceMessageV2Extension) content = content.viewOnceMessageV2Extension.message;
          if (content?.ephemeralMessage) content = content.ephemeralMessage.message;
          if (content?.protocolMessage?.type === 14) {
            const type = getContentType(content.protocolMessage);
            content = content.protocolMessage[type];
          }
          if (content?.message) {
            const type = getContentType(content.message);
            content = content.message[type];
          }
          return content;
        }

        function escapeRegExp(str) {
          return str.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, "\\$&");
        }

        m.id = m.key.id;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.sender = m.fromMe
          ? jidNormalizedUser(conn.user.id)
          : m.chat.includes("@s.whatsapp.net")
            ? m.chat
            : m.key.participant;
        m.name = conn.getName(m.sender) || m.pushName;

        if (m.message) {
          m.message = parseMessage(m.message);
          m.type = Object.keys(m.message).find(
            a => a.includes("conver") ||
              (!a.includes("senderKeyDistributionMessage") && a.endsWith("Message")) ||
              a.includes("V3")
          ) || Object.keys(m.message)[0] || "";

          m.msg = m.message.interactiveResponseMessage ? m.message : m.message[m.type];
          m.bot = m.id.startsWith("BAE5") || (m.id.startsWith("3EB0") && m.id.length === 22);
          m.group = m.chat.endsWith("@g.us");
          m.expiration = m.msg?.contextInfo?.expiration || 0;
          m.viewOnce = !!m.msg?.viewOnce;

          if (m.group) {
            m.metadata = await conn.groupMetadata(m.chat);
            m.gcname = m.metadata.subject;
            m.participants = m.metadata.participants;
            m.isGroupOwner = m.metadata.owner;
            m.admin = m.participants.filter(a => a.admin === "admin" || a.admin === "superadmin").map(a => a.id);
            m.isAdmin = m.admin.includes(m.sender);
            m.isBotAdmin = m.admin.includes(jidNormalizedUser(conn.user?.id));
          }

          m.text = getText(m.msg) || m.message?.conversation;
          m.prefix = new RegExp(`^[${prefix.join("")}^]`, "gi").test(m.text)
            ? m.text.match(new RegExp(`^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]`, "gi"))?.[0]
            : "";
          m.command = m.text?.trim().replace(m.prefix, "").trim().split(/ +/).shift();
          m.args = m.text?.trim()
            .replace(new RegExp("^" + escapeRegExp(m.prefix), "i"), "")
            .replace(m.command, "")
            .split(/ +/)
            .filter(a => a) || [];
          m.mentionedJid = m.msg.contextInfo?.mentionedJid || [];
          m.download = async () => await conn.download(m);

          if (m.msg?.contextInfo?.quotedMessage) {
            const quoted = m.msg.contextInfo;
            m.quoted = {
              key: {
                remoteJid: m.chat,
                id: quoted?.stanzaId,
                fromMe: quoted?.participant.includes(jidNormalizedUser(conn.user?.id)),
                participant: quoted.participant,
              },
              chat: m.chat,
              sender: quoted.participant.includes(jidNormalizedUser(conn.user?.id))
                ? jidNormalizedUser(conn.user.id)
                : quoted.participant || m.chat,
              id: quoted?.stanzaId,
              fromMe: quoted.participant.includes(jidNormalizedUser(conn.user?.id)),
              message: parseMessage(quoted?.quotedMessage),
            };

            const qmsg = m.quoted.message;
            m.quoted.type = Object.keys(qmsg).find(
              a => a.includes("conver") || a.endsWith("Message") || a.includes("V3")
            );
            m.quoted.msg = qmsg[m.quoted.type];
            m.quoted.mentionedJid = quoted?.mentionedJid || [];
            m.quoted.group = m.quoted.chat.endsWith("@g.us");
            m.quoted.viewOnce = !!m.quoted.msg?.viewOnce;
            m.quoted.bot = m.quoted?.id?.includes("BAE5") || m.quoted?.id.startsWith("3EB0");
            m.quoted.text = getText(m.quoted.msg) || m.quoted.message.conversation;

            m.quoted.prefix = new RegExp(`^[${prefix.join("")}^]`, "gi").test(m.quoted.text)
              ? m.quoted.text.match(new RegExp(`^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]`, "gi"))?.[0]
              : "";
            m.quoted.command = m.quoted.text?.trim().replace(m.quoted.prefix, "").trim().split(/ +/).shift();
            m.quoted.args = m.quoted.text?.trim()
              .replace(new RegExp("^" + escapeRegExp(m.quoted.prefix), "i"), "")
              .replace(m.quoted.command, "")
              .split(/ +/)
              .filter(a => a) || [];
            m.quoted.download = async () => await conn.download(m.quoted);
          }

          m.reply = async (text, options = {}) => {
            const msgPayload = typeof text === "string" ? { text, ...options } : { ...text, ...options };
            return await conn.sendMessage(m.chat, msgPayload, {
              quoted: m,
              ephemeralExpiration: m.expiration,
              ...options,
            });
          };

          m.wait = async () => await m.reply("bentar");
        }

        return m;
      },
      enumerable: true,
      configurable: true,
      writable: true,
    },
  });

  if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id);
  store.bind(sock);
  return sock;
}

function protoType() {
  Array.prototype.getRandom = function getRandom() {
    return this[Math.floor(Math.random() * this.length)];
  };

  String.prototype.decodeJid = function decodeJid() {
    if (/:\d+@/gi.test(this)) {
      const decode = jidDecode(this) || {};
      return (decode.user && decode.server && `${decode.user}@${decode.server}` || this).trim();
    } else {
      return this.trim();
    }
  };

  Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
    return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
  };
}

function isNull(args) {
    return !(args !== null && args !== undefined)
}

async function generateProfilePicture(mediaUpload) {
    let bufferOrFilePath
    if (Buffer.isBuffer(mediaUpload)) bufferOrFilePath = mediaUpload
    else if ('url' in mediaUpload) bufferOrFilePath = mediaUpload.url.toString()
    else bufferOrFilePath = await Baileys.toBuffer(mediaUpload.stream)
    const { read, MIME_JPEG, AUTO } = await Promise.resolve().then(async () => (await import('jimp')).default)
    const jimp = await read(bufferOrFilePath)
    const min = jimp.getWidth()
    const max = jimp.getHeight()
    const cropped = jimp.crop(0, 0, min, max)
    return {
        img: await cropped.quality(100).scaleToFit(500, 500, AUTO).getBufferAsync(MIME_JPEG)
    }
}
export { simple, protoType }