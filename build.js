const fs = require('fs')
const dir = process.argv[2]

if (!dir) throw new Error('Invalid directory')

const path = `${__dirname}/${dir}`
const files = fs.readdirSync(path);

if (!files?.length) throw new Error('Invalid directory')

let css = ``

const handlePath = (p) => {
  const isDir = fs.statSync(p).isDirectory()
  if (isDir) {
    const dirFiles = fs.readdirSync(p);
    dirFiles.forEach((f) => handlePath(`${p}/${f}`))
  } else if (!p.endsWith('styles.css') && p.endsWith('.css')) {
    const data = fs.readFileSync(p, { encoding: 'utf8' })
    console.log(p);
    css += `${data}\n\n`
  }
}

files.forEach(f => handlePath(`${path}/${f}`))
fs.writeFileSync(`${path}/index.css`, css)