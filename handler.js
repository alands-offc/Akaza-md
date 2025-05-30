import util from "util";
import fs from "fs";
import {
  jidNormalizedUser,
} from "baileys";
import path, {join} from "path";
import { fileURLToPath } from "url";
await import("./config.js?v=" + Date.now()); 

export async function handler(chatUpdate) {
  if (!chatUpdate?.messages) return;
  let msg = chatUpdate.messages[0];
  if (!msg?.message) return;
  if (msg.key.id.startsWith("BAE5") || (msg.key.id.startsWith("3EB0") && msg.key.id.length === 22)) return 
    let m = await this.smsg(msg)
  try {
    if (!m) return;

    await (await import("./lib/print.js?update=" + Date.now())).default(this, m);

    m.exp = 0;
    m.limit = false;

    // INIT USER, CHAT, SETTING
    try {
      if (typeof global.db.data.users[m.sender] !== 'object') {
      global.db.data.users[m.sender]  = {};
      }
      let user = global.db.data.users[m.sender]
      user.exp ??= 0;
      user.limit ??= 10;
      user.lastclaim ??= 0;
      user.registered ??= false;
      user.name ??= m.name || m.sender;
      user.age ??= -1;
      user.command ??= 0;
      user.regTime ??= -1;
      user.afk ??= -1;
      user.afkReason ??= '';
      user.banned ??= false;
      user.pc ??= 0;
      user.level ??= 0;
      user.role ??= 'Beginner';
      user.autolevelup ??= true;

      if (typeof global.db.data.chats[m.chat] !== 'object') {
      global.db.data.chats[m.chat] = {};
      }
     let chat = global.db.data.chats[m.chat];

      chat.isBanned ??= false;
      chat.welcome ??= false;
      chat.detect ??= false;

      const userId = jidNormalizedUser(this.user.id);
      if (typeof global.db.data.settings[userId] !== 'object') {
      global.db.data.settings[userId] = {};
      }
      let setting = global.db.data.settings[userId];
      setting.anticall ??= false;
      setting.autoread ??= false;
      setting.self ??= false;
    } catch (e) {
      console.error(e);
    }

    if (!m.fromMe && global.db.data.settings[jidNormalizedUser(this.user.id)].self) return;

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

for (let name in global.plugins) {
    let plugin = global.plugins[name];
    if (!plugin || plugin.disabled) continue;

    const __filename = join(___dirname, name);

    // Jalankan fungsi all jika ada
    if (typeof plugin.all === 'function') {
        try {
            await plugin.all.call(this, m, {
                chatUpdate,
                __dirname: ___dirname,
                __filename
            });
        } catch (e) {
            console.error(e);
        }
    }

    

    // Informasi pengguna
    let usedPrefix;
    let _user = global.db.data.users[m.sender] || {};
    let isROwner = [jidNormalizedUser(this.user.id), ...global.owner]
        .map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
        .includes(m.sender);
    let isOwner = isROwner || m.fromMe;
    let isMods, isPrems
    if (m.sender) {
    isMods = global.mods.includes(m.sender.replace("@s.whatsapp.net", ""))? true : false
    isPrems = global.prems.includes(m.sender.replace("@s.whatsapp.net",""))? true : isOwner
    }
    let groupMetadata = m.group ? m.metadata : {};
    let participants = m.group ? groupMetadata.participants : [];
    let isAdmin = m.isAdmin;
    let isBotAdmin = m.isBotAdmin;

    // Blokir user tertentu
    const blockUser = global.db.data.users[m.sender].banned;
    if (blockUser) return;

    // Prefix Matching
    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? conn.prefix : global.prefix;
let prefixes = _prefix instanceof RegExp
    ? [_prefix]
    : Array.isArray(_prefix)
        ? _prefix.map(p => p instanceof RegExp ? p : new RegExp(str2Regex(p)))
        : typeof _prefix === 'string'
            ? [new RegExp(str2Regex(_prefix))]
            : [new RegExp];

let match = null;
for (let re of prefixes) {
    match = re.exec(m.text);
    if (match) {
        usedPrefix = match[0];
        break;
    }
}

    // Jalankan before jika ada
    if (typeof plugin.before === 'function') {
        const shouldSkip = await plugin.before.call(this, m, {
            match,
            conn: this,
            participants,
            groupMetadata,
            bot: this.user,
            isROwner,
            isOwner,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            isBlocked: blockUser,
            __dirname: ___dirname,
            __filename
        });
        if (shouldSkip) continue;
    }

    if (typeof plugin !== 'function') continue;

    // Cek apakah prefix cocok
    if (
    (plugin.prefix === false && (usedPrefix = '') !== undefined) ||
    (plugin.prefix === 'optional' && ((usedPrefix = match ? match[0] : '') !== undefined)) ||
    (plugin.prefix !== false && plugin.prefix !== 'optional' && match)
) {
        let noPrefix = m.text? m.text.replace(usedPrefix, '') : ""
        let [command, ...args] = noPrefix.trim().split(/\s+/);
        args = m.args || args
        let _args = m.args || noPrefix.trim().split(/\s+/).slice(1)
        let text = _args.join(' ');
        command = (command || m.command || "").toLowerCase();
        let fail = plugin.fail || global.dfail;
        let isAccept = plugin.command instanceof RegExp
            ? plugin.command.test(command)
            : Array.isArray(plugin.command)
                ? plugin.command.some(cmd =>
                    cmd instanceof RegExp ? cmd.test(command) : cmd === command
                )
                : plugin.command === command;

        if (!isAccept) continue;

        let chat = global.db.data.chats[m.chat];
        let user = global.db.data.users[m.sender];
        user.command += 1
            if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    if (name != 'owner-unbanchat.js' && name != 'owner-eval.js' && name != 'owner-exec.js' && chat?.isBanned)
                        return 
                    if (name != 'owner-unbanuser.js' && user?.banned)
                        return
                }
        if (plugin.rowner && !isROwner) return;
        if (plugin.owner && !isOwner) return;
        if (plugin.mods && !isMods) return;
        if (plugin.premium && !isPrems) return;
        if (plugin.group && !m.group) return;
        if (plugin.botAdmin && !isBotAdmin) return;
        if (plugin.admin && !isAdmin) return;
        if (plugin.private && m.group) return;
        if (plugin.register === true && !_user.registered) return m.reply("kamu belum terdaftar silahkan ketik .daftar nama|umur");


if (typeof plugin.exp === "number") {
  user.exp += plugin.exp;
}

        let extra = {
            match,
            usedPrefix,
            noPrefix,
            _args,
            args,
            command,
            text,
            conn: this,
            participants,
            groupMetadata,
            user,
            bot: this.user,
            isROwner,
            isOwner,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            isBlocked: blockUser
        };

        // Jalankan plugin utama
        try {
          if (!isPrems && typeof plugin.limit === "number") {
  if (user.limit < plugin.limit) {
    return m.reply(
      `Limit kamu tidak cukup untuk menggunakan fitur ini.\nSilakan *buy limit* atau *claim limit harian*.\nCek: *.listclaim*`
    );
  }
}
            await plugin.call(this, m, extra);
            if (isPrems) return 
            if (!isPrems) m.limit = m.limit || plugin.limit || false;
            if (typeof plugin.limit === "number") {
              user.limit -= plugin.limit;
            }
        } catch (e) {
            m.error = e;
           m.reply(util.format(e))
            //console.log(e)
        } finally {
            if (typeof plugin.after === 'function') {
                try {
                    await plugin.after.call(this, m, extra);
                } catch (e) {
                 // m.reply(e.message)
                    console.error(e);
                }
            }
        }

        // Simpan database
        if (global.db.data) await global.db.write();
    }
}

  } catch (err) {
    console.error(err)
   // this.reply(m.chat, e.message, {}, m)
  }
}
export async function participantsupdate(anunya) {
  console.log(anunya);
  if (!global.db.data.chats?.[anunya.id]?.welcome) return

  const metadata = await this.groupMetadata(anunya.id);
  const participants = metadata.participants.map(p => p.id);
  const author = anunya.author;
  const totalMembers = participants.length;

  for (let orang of anunya.participants) {
    const nomor = orang.replace("@s.whatsapp.net", "");
    let text;

    if (author === orang) {
      text = `Hai ${nomor}, ${anunya.action === "add"? "selamat datang di" : "selamat tinggal dari"} ${metadata.subject}`;
    } else {
      text = `Hai ${nomor}, ${anunya.action === "add"? "telah di tambahkan ke" : "telah di keluarkan dari "} ${metadata.subject}\nDilakukan oleh: ${author.replace("@s.whatsapp.net", "")}`;
    }

    const contextInfo = {
      mentionedJid: [author, orang],
      externalAdReply: {
        thumbnailUrl: "https://pomf2.lain.la/f/ic51evmj.jpg",
        title: anunya.action === "add" ? "© Welcome" : "© Left",
        body: "",
        renderLargerThumbnail: true,
        sourceUrl: "https://www.alxzy.xyz",
        mediaType: 1
      }
    };

    switch (anunya.action) {
      case "add":
      case "remove":
        
        await this.sendMessage(anunya.id, { text,  contextInfo: contextInfo });
        break;
    }
  }
}


function isNumber(n) {
  return typeof n === 'number' && !isNaN(n);
}
