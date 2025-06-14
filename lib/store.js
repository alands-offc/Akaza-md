import { readFileSync, writeFileSync, existsSync } from 'fs';
const { initAuthCreds, BufferJSON, proto } = (await import('baileys')).default

function bind(conn) {
    if (!conn.chats) conn.chats = {};

    const updateNameToDb = (contacts) => {
        if (!contacts) return;
        try {
            contacts = contacts.contacts || contacts;
            for (const contact of contacts) {
                const id = conn.decodeJid(contact.id);
                if (!id || id === 'status@broadcast') continue;

                let chats = conn.chats[id] || {};
                conn.chats[id] = {
                    ...chats,
                    ...contact,
                    id,
                    ...(id.endsWith('@g.us')
                        ? { subject: contact.subject || contact.name || chats.subject || '' }
                        : { name: contact.notify || contact.name || chats.name || chats.notify || '' })
                };
            }
        } catch (e) {
            console.error('updateNameToDb error:', e);
        }
    };

    conn.ev.on('contacts.upsert', updateNameToDb);
    conn.ev.on('groups.update', updateNameToDb);
    conn.ev.on('contacts.set', updateNameToDb);

    conn.ev.on('chats.set', async ({ chats }) => {
        for (let { id, name, readOnly } of chats) {
            try {
                id = conn.decodeJid(id);
                if (!id || id === 'status@broadcast') continue;

                const isGroup = id.endsWith('@g.us');
                let chat = conn.chats[id] || { id };
                chat.isChats = !readOnly;
                if (name) chat[isGroup ? 'subject' : 'name'] = name;

                if (isGroup) {
                    const metadata = await conn.groupMetadata(id).catch(() => null);
                    if (metadata) {
                        chat.subject = chat.subject || metadata.subject;
                        chat.metadata = metadata;
                    }
                }
                conn.chats[id] = chat;
            } catch (e) {
                console.error('chats.set error:', e);
            }
        }
    });

    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (!id) return;
        id = conn.decodeJid(id);
        if (id === 'status@broadcast') return;

        let chat = conn.chats[id] || { id };
        chat.isChats = true;
        const metadata = await conn.groupMetadata(id).catch(() => null);
        if (metadata) {
            chat.subject = metadata.subject;
            chat.metadata = metadata;
        }
        conn.chats[id] = chat;
    });

    conn.ev.on('groups.update', async (groupsUpdates) => {
        for (const update of groupsUpdates) {
            try {
                const id = conn.decodeJid(update.id);
                if (!id || id === 'status@broadcast' || !id.endsWith('@g.us')) continue;

                let chat = conn.chats[id] || { id };
                chat.isChats = true;
                const metadata = await conn.groupMetadata(id).catch(() => null);

                if (metadata) chat.metadata = metadata;
                if (update.subject || metadata?.subject) chat.subject = update.subject || metadata.subject;
                conn.chats[id] = chat;
            } catch (e) {
                console.error('groups.update error:', e);
            }
        }
    });

    conn.ev.on('chats.upsert', (chat) => {
        try {
            const { id, name } = chat;
            if (!id || id === 'status@broadcast') return;
            const isGroup = id.endsWith('@g.us');
            conn.chats[id] = {
                ...(conn.chats[id] || {}),
                ...chat,
                isChats: true
            };
            if (isGroup) conn.insertAllGroup?.().catch(() => null);
        } catch (e) {
            console.error('chats.upsert error:', e);
        }
    });

    conn.ev.on('presence.update', async ({ id, presences }) => {
        try {
            const sender = Object.keys(presences)[0] || id;
            const _sender = conn.decodeJid(sender);
            const presence = presences[sender]?.lastKnownPresence || 'composing';

            let chat = conn.chats[_sender] || { id: sender };
            chat.presences = presence;
            conn.chats[_sender] = chat;

            if (id.endsWith('@g.us')) {
                let groupChat = conn.chats[id] || { id };
                conn.chats[id] = groupChat;
            }
        } catch (e) {
            console.error('presence.update error:', e);
        }
    });
}

const KEY_MAP = {
    'pre-key': 'preKeys',
    'session': 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory'
};

function useSingleFileAuthState(filename, logger) {
    let creds, keys = {}, saveCount = 0;

    const saveState = (forceSave = false) => {
        logger?.trace('Saving auth state');
        saveCount++;
        if (forceSave || saveCount > 5) {
            writeFileSync(
                filename,
                JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
            );
            saveCount = 0;
        }
    };

    if (existsSync(filename)) {
        const result = JSON.parse(readFileSync(filename, 'utf-8'), BufferJSON.reviver);
        creds = result.creds;
        keys = result.keys;
    } else {
        creds = initAuthCreds();
        keys = {};
    }

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const key = KEY_MAP[type];
                    return ids.reduce((dict, id) => {
                        let value = keys[key]?.[id];
                        if (value && type === 'app-state-sync-key') {
                            value = proto.AppStateSyncKeyData.fromObject(value);
                        }
                        if (value) dict[id] = value;
                        return dict;
                    }, {});
                },
                set: (data) => {
                    for (const _key in data) {
                        const key = KEY_MAP[_key];
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[_key]);
                    }
                    saveState();
                }
            }
        },
        saveState
    };
}

export default {
    bind,
    useSingleFileAuthState
};
