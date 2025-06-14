import { TextEncoder } from 'util';
const webpp = await import("node-webpmux");
const Image = webpp.default.Image
const webp = webpp.default
import fs from'fs'
import { writeFile, readFile, unlink } from 'fs/promises'
import { platform } from 'os'
import path from 'path'
import Crypto, { randomBytes } from 'crypto'
import { spawn } from 'child_process'
import { fileURLToPath, pathToFileURL } from "url"
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; global.__require = function require(dir = import.meta.url) { return createRequire(dir) }
const tmp = global.__dirname(import.meta.url)
export async function videoToWebp(buffer) {
    const randomName = () => randomBytes(6).toString('hex')
    const inputPath = path.join(tmp, `../tmp/${randomName()}.mp4`)
    const outputPath = path.join(tmp, `../tmp/${randomName()}.webp`)

    await writeFile(inputPath, buffer)

    const args = [
  '-i', inputPath,
  '-vcodec', 'libwebp',
  '-vf', "scale=w='if(gt(iw,ih),320,-1)':h='if(gt(ih,iw),320,-1)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
  '-loop', '0',
  '-ss', '00:00:00',
  '-t', '00:00:05',
  '-preset', 'default',
  '-an',
  '-fps_mode', 'vfr',
  outputPath
]


    await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', args)
        ffmpeg.stderr.on('data', data => process.stderr.write(data)) 
        ffmpeg.on('error', reject)
        ffmpeg.on('close', code => {
            if (code !== 0) reject(new Error(`ffmpeg exited with code ${code}`))
            else resolve()
        })
    })

    const webpBuffer = await readFile(outputPath)
    await unlink(inputPath)
    await unlink(outputPath)

    return webpBuffer
}

export async function writeExifVid(media, metadata) {
    let wMedia = await videoToWebp(media)
    const tmpFileIn = path.join(tmp, `../tmp/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const tmpFileOut = path.join(tmp, `../tmp/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    fs.writeFileSync(tmpFileIn, wMedia)
    if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = { "sticker-pack-id": `https://www.alxzy.com`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])

        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)
        return tmpFileOut

    }
}
class RawMetadata {
  constructor({
    'sticker-pack-id': id,
    'sticker-pack-name': name,
    'sticker-pack-publisher': publisher,
    emojis = []
  }) {
    this['sticker-pack-id'] = id || 'com.akaza.sticker';
    this['sticker-pack-name'] = name || 'Sticker By';
    this['sticker-pack-publisher'] = publisher || 'Akaza-md';
    this['android-app-store-link'] = 'https://play.google.com/store/apps/details?id=com.whatsapp';
    this['ios-app-store-link'] = 'https://itunes.apple.com/app/whatsapp-messenger/id310633997';
    this.emojis = emojis;
  }
}

export default class Exif {
  constructor(options) {
    this.data = new RawMetadata(options);
    this.exif = null;
  }

  build() {
    const data = JSON.stringify(this.data);
    const exif = Buffer.concat([
      Buffer.from([
        0x49, 0x49, 0x2a, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00,
        0x00, 0x00
      ]),
      Buffer.from(data, 'utf-8')
    ]);

    exif.writeUIntLE(new TextEncoder().encode(data).length, 14, 4);
    return exif;
  }

  async add(image) {
    const exif = this.exif || this.build();

    const img = image instanceof Image
      ? image
      : await (async () => {
          const i = new Image();
          await i.load(image);
          return i;
        })();

    img.exif = exif;
    return await img.save(null);
  }
}
