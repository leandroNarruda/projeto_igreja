import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../public/images/logos/logo-bom-de-licao.png')
const out = resolve(__dirname, '../public/images/logos')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512, 1024]

for (const size of sizes) {
  await sharp(src).resize(size, size).toFile(`${out}/logo-bom-de-licao-${size}.png`)
  console.log(`✓ ${size}x${size}`)
}

const BG = { r: 18, g: 10, b: 20, alpha: 1 } // #120a14
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.6)
  const logo = await sharp(src)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(`${out}/logo-bom-de-licao-${size}-maskable.png`)
  console.log(`✓ ${size}x${size} maskable`)
}

console.log('Todos os ícones gerados com sucesso!')
