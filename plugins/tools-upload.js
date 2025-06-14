import fetch from 'node-fetch'
import { Buffer } from 'buffer'

const GITHUB_USERNAME = namaGithub
const REPO_NAME = repoGithub
const BRANCH = 'main'
const GITHUB_TOKEN = githubToken

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q.message).mimetype

  if (/image\/(png|jpe?g)/.test(mime)) {
    let media = await q.download()
    let ext = mime.split("/")[1]
    let filename = `${Date.now()}.${ext}`
    let content = Buffer.from(media).toString('base64')

    let apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${filename}`

    let body = {
      message: `upload ${filename}`,
      committer: {
        name: "UploadBot",
        email: "bot@upload.com"
      },
      content,
      branch: BRANCH
    }

    let res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "upload-script"
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      let err = await res.json()
      throw `Gagal upload: ${err.message || "unknown error"}`
    }

    let json = await res.json()
    let rawUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH}/${filename}`
    let text = `*Upload Berhasil*\n• Type: *${mime}*\n• URL: ${rawUrl}\n• Expired: *Never*`
    m.reply(text)

  } else {
    m.reply("Reply gambar saja (jpg/png)")
  }
}

handler.command = ["tourl"]
handler.tags = ["tools"]
handler.limit = 2

export default handler
