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

for (const size of [192, 512]) {
  await sharp(src).resize(size, size).toFile(`${out}/logo-bom-de-licao-${size}-maskable.png`)
  console.log(`✓ ${size}x${size} maskable`)
}

console.log('Todos os ícones gerados com sucesso!')
