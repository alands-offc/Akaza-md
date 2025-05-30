// 📈 Auto Level Up Plugin
// Source: https://github.com/ShirokamiRyzen/Nao-MD/blob/main/plugins/_autolevelup.js.bakk

import { xpRange, canLevelUp, findLevel } from '../lib/levelling.js'
import fetch from 'node-fetch'

export const all = async (m) => {
  if (!m.sender) return
    let user = global.db.data.users[m.sender]
    if (!user.autolevelup) return !0

    let users = Object.entries(global.db.data.users).map(([key, value]) => ({ ...value, jid: key }))
    let who = m.sender
    let exp = user.exp
    let logo = await (await fetch(thumbnail)).buffer()
    let wm = "Alxzy"
    let discriminator = who.substring(9, 13)
    let role = user.role
    let sortedLevel = users.map(toNumber('level')).sort(sort('level'))
    let usersLevel = sortedLevel.map(enumGetKey)
    let { min, xp, max } = xpRange(user.level, global.multiplier)
    let username = m.name
    if (!user.autolevelup) return !0

    let before = user.level
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++

    if (before !== user.level) {
      let _role = getRoleByLevel(user.level)
      user.role = _role
        let tag = `@${m.sender.replace(/@.+/, '')}`
        let levelUpMsg = `
✨ *LEVEL UP!* ✨
────────────────────
👤 *Name:* ${tag}
⚡ *Exp:* ${exp}
🎯 *Level:* ${before} ➜ ${user.level}
🏷️ *Role:* ${role} ➜ ${_role}
────────────────────
Terus semangat dan tetap aktif ya! 💪🔥
        `.trim()

        await conn.sendMessage(m.chat, {
            image: logo,
            caption: levelUpMsg,
            mentions: [m.sender]
        })
    }
}

function getRoleByLevel(level) {
  if (level >= 100) return '👑 Immortal'
  if (level >= 90) return '🛡 Mythic'
  if (level >= 80) return '🎖 Legend'
  if (level >= 70) return '⚔ Grandmaster'
  if (level >= 60) return '🔥 Master'
  if (level >= 50) return '💎 Diamond'
  if (level >= 40) return '🔷 Platinum'
  if (level >= 30) return '🥇 Gold'
  if (level >= 20) return '🥈 Elite'
  if (level >= 10) return '🥉 Bronze'
  return '👶 Rookie'
}
function sort(property, ascending = true) {
    return property
        ? (...args) => args[ascending & 1][property] - args[!ascending & 1][property]
        : (...args) => args[ascending & 1] - args[!ascending & 1]
}

function toNumber(property, _default = 0) {
    return property
        ? (a, i, b) => ({ ...b[i], [property]: a[property] === undefined ? _default : a[property] })
        : a => a === undefined ? _default : a
}

function enumGetKey(a) {
    return a.jid
}
