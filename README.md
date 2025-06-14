# 💬 Akaza-md: Multi-Device Bot Whatsapp

<p align="center">
  <img src="https://raw.githubusercontent.com/alands-offc/alxzydb/main/1749919242494.jpeg" alt="Akaza-md Logo" width="200"/>
</p>

Akaza-md is a powerful and versatile WhatsApp bot built with **Node.js**, designed to enhance your WhatsApp experience with rich features for automation, fun, and productivity.

---

## 🚀 Quick Setup

### 📱 For Termux / Ubuntu / SSH Users

```bash
# Update and upgrade packages
apt update && apt upgrade -y

# Install required dependencies
apt install git nodejs ffmpeg -y

# Clone the Akaza-md repository
git clone https://github.com/alands-offc/Akaza-md

# Enter the project directory
cd Akaza-md

# Install all dependencies
npm install

# Start the bot
npm start
```

---

### 💻 For Windows / VPS / RDP Users

#### 🧰 Prerequisites
Make sure you have the following installed:

- [Git](https://git-scm.com/)
- [Node.js (LTS)](https://nodejs.org/)
- [FFmpeg](https://ffmpeg.org/) — Add to `PATH`
- [ImageMagick](https://imagemagick.org/) — Add to `PATH`

#### 📥 Installation Steps

```bash
# Clone the Akaza-md repository
git clone https://github.com/alands-offc/Akaza-md

# Enter the project directory
cd Akaza-md

# Install dependencies
npm install

# Optional: Update packages
npm update

# Run the bot
node .
```

---

## ⚙️ Command-Line Arguments (Optional)

You can launch Akaza-md with extra options:

### `--pairing`

- **Use pairing code for login**
- Launches the bot in pairing mode, ideal for multi-device login.
```bash
node . --pairing
```

---

### `--githubdb`

- **Use GitHub as remote database**
- Requires configuration in `config.js`:
  - Set `githubToken`
  - Set `namaGithub`
  - Set `repoGithub`
```bash
node . --githubdb
```

> ⚠️ **Note:** This will sync your bot database to a GitHub repo and this is EXPERIMENTAL.

---

## 📜 Changelog

Stay up-to-date with the latest features, fixes, and updates:
👉 [GitHub Releases](https://github.com/alands-offc/Akaza-md/releases)

---

## 🙏 Contributing

We welcome contributions of all kinds!  
📥 Submit issues or pull requests via [GitHub Issues](https://github.com/alands-offc/Akaza-md/issues)

---

## 🛡️ License

Akaza-md is released under the **MIT License**.

---

## 🤖 Created With ❤️ by [Alxzy](https://www.alxzy.xyz)

Happy chatting with **Akaza-md**!
