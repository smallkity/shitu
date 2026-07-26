const sharp = require('sharp')
const fs = require('fs')

async function generate() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="115" fill="#bd704e"/><path d="M256 101c13 72 43 103 115 115-72 13-102 43-115 115-13-72-43-102-115-115 72-12 102-43 115-115Z" fill="#fffaf6"/><circle cx="381" cy="130" r="22" fill="#f4c9ad"/></svg>'

  await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icons/icon-192.png')
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icons/icon-512.png')

  const svgMaskable = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#bd704e"/><path transform="translate(64 64) scale(0.75)" d="M256 101c13 72 43 103 115 115-72 13-102 43-115 115-13-72-43-102-115-115 72-12 102-43 115-115Z" fill="#fffaf6"/><circle cx="345" cy="145" r="22" fill="#f4c9ad"/></svg>'

  await sharp(Buffer.from(svgMaskable)).resize(192, 192).png().toFile('public/icons/maskable-192.png')
  await sharp(Buffer.from(svgMaskable)).resize(512, 512).png().toFile('public/icons/maskable-512.png')

  console.log('PNG icons generated')
  console.log(fs.readdirSync('public/icons').map(f => f + ' ' + fs.statSync('public/icons/' + f).size + ' bytes').join('\n'))
}

generate().catch(e => { console.error(e); process.exit(1) })
