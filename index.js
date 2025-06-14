import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CFonts from "cfonts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
global.__dirname = __dirname;

let datas = fs.readFileSync("./package.json", "utf-8");
let packages = JSON.parse(datas) || {};

CFonts.say('Lightweight\nWhatsApp Bot', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', 'magenta']
});

CFonts.say(`${packages.name} By ${packages.author.name || packages.author}`, {
  font: 'console',
  align: 'center',
  gradient: ['red', 'magenta']
});

var isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [path.join(__dirname, file), ...process.argv.slice(2)];

  CFonts.say([process.argv[0], ...args].join(' '), {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta']
  });

  const p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  p.on('message', data => {
    console.log('[RECEIVED]', data);
    switch (data) {
      case 'reset':
        p.kill();
        isRunning = false;
        start(file);
        break;
      case 'uptime':
        p.send(process.uptime()); 
        break;
    }
  });

  p.on('exit', code => {
    isRunning = false;
    console.error('Exited with code:', code);
    start(file)
    if (code === 0) return;
    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
      start(file);
    });
  });
}

start('main.js');
