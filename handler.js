import util from "util";
import fs from "fs";
import { jidNormalizedUser } from "baileys";
import path, { join } from "path";
import { fileURLToPath } from "url";
await import("./config.js?v=" + Date.now()); 

export async function handler(chatUpdate) {
  if (!chatUpdate?.messages || !chatUpdate.messages[0]?.message) return;

  const msg = chatUpdate.messages[0];

  if (msg.key.id.startsWith("BAE5") || (msg.key.id.startsWith("3EB0") && msg.key.id.length === 22)) return;

  try {
    const m = await this.smsg(msg);
    if (!m) return;

    await (await import("./lib/print.js?update=" + Date.now())).default(this, m);

    m.exp = 0;
    m.limit = false;

    try {
      global.db.data.users[m.sender] ??= {};
      let user = global.db.data.users[m.sender];
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

      global.db.data.chats[m.chat] ??= {};
      let chat = global.db.data.chats[m.chat];
      chat.isBanned ??= false;
      chat.welcome ??= false;
      chat.detect ??= false;

      const userId = jidNormalizedUser(this.user.id);
      global.db.data.settings[userId] ??= {};
      let setting = global.db.data.settings[userId];
      setting.anticall ??= false;
      setting.autoread ??= false;
      setting.self ??= false;
    } catch (e) {
      console.error("Error initializing database:", e);
    }

    if (!m.fromMe && global.db.data.settings[jidNormalizedUser(this.user.id)]?.self) return;

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

    for (let name in global.plugins) {
      const plugin = global.plugins[name];
      if (!plugin || plugin.disabled) continue;

      const __filename = join(___dirname, name);

      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: ___dirname,
            __filename
          });
        } catch (e) {
          console.error("Error in plugin.all:", e);
        }
      }

      let usedPrefix;
      const _user = global.db.data.users[m.sender] || {};
      const isROwner = [jidNormalizedUser(this.user.id), ...global.owner]
        .map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
        .includes(m.sender);
      const isOwner = isROwner || m.fromMe;
      
      let isMods = false;
      let isPrems = false;
      if (m.sender) {
        isMods = global.mods.includes(m.sender.replace("@s.whatsapp.net", ""));
        isPrems = global.prems.includes(m.sender.replace("@s.whatsapp.net", "")) || isOwner;
      }
      
      const groupMetadata = m.group ? m.metadata : {};
      const participants = m.group ? groupMetadata.participants : [];
      const isAdmin = m.isAdmin;
      const isBotAdmin = m.isBotAdmin;

      const blockUser = global.db.data.users[m.sender]?.banned;
      if (blockUser) continue; 

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      
      const _prefix = plugin.customPrefix ?? (this.prefix ?? global.prefix);
      const prefixes = _prefix instanceof RegExp
        ? [_prefix]
        : Array.isArray(_prefix)
          ? _prefix.map(p => p instanceof RegExp ? p : new RegExp(str2Regex(p)))
          : typeof _prefix === 'string'
            ? [new RegExp(str2Regex(_prefix))]
            : [new RegExp()];

      let match = null;
      for (let re of prefixes) {
        match = re.exec(m.text);
        if (match) {
          usedPrefix = match[0];
          break;
        }
      }

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

      const isPrefixMatch = 
        (plugin.prefix === false && (usedPrefix = '') !== undefined) ||
        (plugin.prefix === 'optional' && ((usedPrefix = match ? match[0] : '') !== undefined)) ||
        (plugin.prefix !== false && plugin.prefix !== 'optional' && match);

      if (isPrefixMatch) {
        const noPrefix = m.text?.replace(usedPrefix, '') || "";
        let [command, ...args] = noPrefix.trim().split(/\s+/);
        args = m.args || args;
        const _args = m.args || noPrefix.trim().split(/\s+/).slice(1);
        const text = _args.join(' ');
        command = (command || m.command || "").toLowerCase();
        const fail = plugin.fail || global.dfail;
        
        const isAccept = plugin.command instanceof RegExp
          ? plugin.command.test(command)
          : Array.isArray(plugin.command)
            ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
            : plugin.command === command;

        if (!isAccept) continue;

        const chat = global.db.data.chats[m.chat];
        const user = global.db.data.users[m.sender];
        user.command += 1;

        const isBannedCommand = ['owner-unbanchat.js', 'owner-eval.js', 'owner-exec.js'].includes(name);
        const isUnbanUserCommand = name === 'owner-unbanuser.js';

        if (!isBannedCommand && chat?.isBanned) return;
        if (!isUnbanUserCommand && user?.banned) return;

        if (plugin.rowner && !isROwner) return;
        if (plugin.owner && !isOwner) return;
        if (plugin.mods && !isMods) return;
        if (plugin.premium && !isPrems) return;
        if (plugin.group && !m.group) return;
        if (plugin.botAdmin && !isBotAdmin) return;
        if (plugin.admin && !isAdmin) return;
        if (plugin.private && m.group) return;
        if (plugin.register === true && !_user.registered) {
          return m.reply("Kamu belum terdaftar, silahkan ketik .daftar nama|umur");
        }

        if (typeof plugin.exp === "number") {
          user.exp += plugin.exp;
        }

        const extra = {
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

        try {
          if (!isPrems && typeof plugin.limit === "number") {
            if (user.limit < plugin.limit) {
              return m.reply(
                `Limit kamu tidak cukup untuk menggunakan fitur ini.\nSilakan *buy limit* atau *claim limit harian*.\nCek: *.listclaim*`
              );
            }
          }
          
          await plugin.call(this, m, extra);

          if (!isPrems && typeof plugin.limit === "number") {
            user.limit -= plugin.limit;
          }
          m.limit = m.limit || plugin.limit || false; 

        } catch (e) {
          m.error = e;
          m.reply(util.format(e));
          console.error("Error in plugin execution:", e);
        } finally {
          if (typeof plugin.after === 'function') {
            try {
              await plugin.after.call(this, m, extra);
            } catch (e) {
              console.error("Error in plugin.after:", e);
            }
          }
        }
        if (global.db.data) await global.db.write();
      }
    }
  } catch (err) {
    console.error("Unhandled error in handler:", err);
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

    if (author === orang || !author) {
      text = `Hai @${nomor}, ${anunya.action === "add"? "selamat datang di" : "selamat tinggal dari"} ${metadata.subject}`;
    } else {
      text = `Hai @${nomor}, ${anunya.action === "add"? "telah di tambahkan ke" : "telah di keluarkan dari "} ${metadata.subject}\nDilakukan oleh: @${author?.replace("@s.whatsapp.net", "")}`;
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
