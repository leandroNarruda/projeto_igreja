export const VERSINOS_POR_NIVEL = 20

export interface NivelInfo {
  titulo: string
  emoji: string
  gradient: string
}

const NIVEIS: NivelInfo[] = [
  {
    titulo: 'Semente',
    emoji: '🌱',
    gradient: 'from-lime-400 via-green-500 to-emerald-500',
  },
  {
    titulo: 'Discípulo',
    emoji: '📖',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
  },
  {
    titulo: 'Estudante',
    emoji: '✨',
    gradient: 'from-blue-400 via-indigo-500 to-purple-500',
  },
  {
    titulo: 'Guardador',
    emoji: '🛡️',
    gradient: 'from-teal-400 via-cyan-500 to-sky-600',
  },
  {
    titulo: 'Proclamador',
    emoji: '🔥',
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
  },
  {
    titulo: 'Intercessor',
    emoji: '🕊️',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
  },
  {
    titulo: 'Arauto',
    emoji: '📯',
    gradient: 'from-purple-400 via-pink-500 to-rose-500',
  },
  {
    titulo: 'Profeta',
    emoji: '🌟',
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
  },
  {
    titulo: 'Guardião',
    emoji: '🌿',
    gradient: 'from-red-500 via-rose-600 to-pink-700',
  },
  {
    titulo: 'Patriarca',
    emoji: '💎',
    gradient: 'from-sky-300 via-blue-500 to-indigo-600',
  },
  {
    titulo: 'Lenda Bíblica',
    emoji: '🏆',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500',
  },
]

export function getNivelInfo(nivel: number): NivelInfo {
  const idx = Math.min(nivel - 1, NIVEIS.length - 1)
  return NIVEIS[Math.max(0, idx)]
}

export function isNivelMaximo(nivel: number): boolean {
  return nivel >= NIVEIS.length
}
