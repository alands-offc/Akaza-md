import { spawn } from 'child_process'
import { writeFile, readFile, unlink } from 'fs/promises'
import fs from "fs"
import { tmpdir, platform } from 'os'
import path from 'path'
import crypto from 'crypto'
import Exif, { writeExifVid, videoToWebp } from './Exif.js' 
import { fileURLToPath, pathToFileURL } from "url"
const getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; global.__require = function require(dir = import.meta.url) { return createRequire(dir) }

export async function videoToSticker(buff, pack, authorr) {
let buffer
let options = { packname: pack || global.packname, author: authorr || global.author }
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
return buffer
}
export async function imageToSticker(buffer, metadata = { packname: "Sticker By", author: "Akaza-md" }) {
  const tmp = global.__dirname(import.meta.url)
  const inputPath = path.join(tmp, `../tmp/${Date.now()}.jpg`)
  const webpPath = inputPath.replace('.jpg', '.webp')

  await writeFile(inputPath, buffer)

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i', inputPath,
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
      '-vcodec', 'libwebp',
      '-lossless', '1',
      '-preset', 'default',
      '-loop', '0',
      '-an',
      '-vsync', '0',
      webpPath
    ])

    ffmpeg.on('close', code => {
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))
    })
  })

  const webpBuffer = await readFile(webpPath)

  const exif = new Exif({
    'sticker-pack-id': 'com.akaza.sticker',
    'sticker-pack-name': metadata.packname,
    'sticker-pack-publisher': metadata.author,
    'emojis': ['✨']
  })

  const finalBuffer = await exif.add(webpBuffer)

  return finalBuffer
}
