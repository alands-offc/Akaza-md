import fs from "fs";
import assert from "assert";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let folders = ['.', ...Object.keys(JSON.parse(fs.readFileSync('./package.json')).directories)]
let files = []
for (let folder of folders)
  for (let file of fs.readdirSync(folder).filter(v => v.endsWith('.js')))
    files.push(path.resolve(path.join(folder, file)))
for (let file of files) {
  if (file == path.join(__dirname, __filename)) continue
  console.error('Checking', file)
  spawn(process.argv0, ['-c', file])
    .on('close', () => {
      assert.ok(file)
      console.log('Done', file)
    })
    .stderr.on('data', chunk => assert.ok(chunk.length < 1, file + '\n\n' + chunk))
}
