import fetch from 'node-fetch'

// DATABASE GITHUB
export class GitHubAdapter {
  constructor({ owner, repo, token, path = 'db.json', branch = 'main' }) {
    this.owner = owner
    this.repo = repo
    this.token = token
    this.path = path
    this.branch = branch
    this.apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    this.rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
    this.sha = null
  }

  async read() {
    try {
      const res = await fetch(this.apiBase + `?ref=${this.branch}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`GitHub read failed: ${res.status} ${res.statusText}\n${msg}`)
      }

      const json = await res.json()
      this.sha = json.sha
      const content = Buffer.from(json.content, 'base64').toString()
      return JSON.parse(content)
    } catch (err) {
      console.error('GitHubAdapter read error:', err.message || err)
      return null
    }
  }

  async write(data) {
    try {
      const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
      const body = {
        message: 'update db.json',
        content,
        branch: this.branch,
        committer: {
          name: 'Bot',
          email: 'gggwbjir@gmail.com'
        },
        ...(this.sha ? { sha: this.sha } : {})
      }

      const res = await fetch(this.apiBase, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`, 
          Accept: 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`GitHub write failed: ${res.status} ${res.statusText}\n${msg}`)
      }

      const json = await res.json()
      this.sha = json.content.sha
    } catch (err) {
      console.error('GitHubAdapter write error:', err.message || err)
    }
  }
}
