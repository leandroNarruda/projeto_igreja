const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

try {
  // Obtém o hash do commit atual
  const commitHash = execSync('git rev-parse HEAD', {
    encoding: 'utf-8',
  }).trim()

  // Obtém a data do commit
  const commitDate = execSync('git log -1 --format=%ci', {
    encoding: 'utf-8',
  }).trim()

  // Cria o objeto de versão
  const version = {
    commitHash,
    commitDate,
    buildDate: new Date().toISOString(),
  }

  // Caminho para o arquivo version.json no diretório public
  const publicDir = path.join(__dirname, '..', 'public')
  const versionPath = path.join(publicDir, 'version.json')

  // Garante que o diretório public existe
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Escreve o arquivo version.json
  fs.writeFileSync(versionPath, JSON.stringify(version, null, 2))

  console.log('✅ version.json gerado com sucesso')
  console.log(`   Commit: ${commitHash.substring(0, 7)}`)
} catch (error) {
  // Se não estiver em um repositório Git ou houver erro, usa um fallback
  console.warn(
    '⚠️  Não foi possível obter o commit hash do Git:',
    error.message
  )

  const version = {
    commitHash: `build-${Date.now()}`,
    commitDate: new Date().toISOString(),
    buildDate: new Date().toISOString(),
  }

  const publicDir = path.join(__dirname, '..', 'public')
  const versionPath = path.join(publicDir, 'version.json')

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(versionPath, JSON.stringify(version, null, 2))

  console.log('✅ version.json gerado com hash de fallback')
}
