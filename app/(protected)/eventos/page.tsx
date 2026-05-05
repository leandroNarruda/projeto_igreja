'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { Card } from '@/components/ui/Card'

interface AccordionProps {
  title: string
  emoji: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

function Accordion({ title, emoji, open, onToggle, children }: AccordionProps) {
  return (
    <div className="bg-bg-card rounded-lg shadow-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl drop-shadow-lg shrink-0">{emoji}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-accent truncate">
            {title}
          </h2>
        </div>
        <ChevronDown
          className={`size-6 text-lavender shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function EventosPage() {
  const [openId, setOpenId] = useState<'versinhos' | 'sabatina' | null>(
    'versinhos'
  )

  const toggle = (id: 'versinhos' | 'sabatina') =>
    setOpenId(curr => (curr === id ? null : id))

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Accordion
            title="Quiz de Versinhos Bíblicos"
            emoji="📖"
            open={openId === 'versinhos'}
            onToggle={() => toggle('versinhos')}
          >
            <div className="text-center mb-8">
              <p className="text-xl text-lavender max-w-3xl mx-auto">
                Decore versículos bíblicos de um jeito divertido! Acerte e suba
                de nível, mostrando seu conhecimento das Escrituras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                bgClassName="bg-gradient-to-br from-emerald-900/60 via-teal-800/40 to-cyan-900/30"
                borderClassName="border border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                index={0}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  🎯
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Como funciona
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  A cada rodada você recebe 10 versículos. Para cada um, escolha
                  entre 5 alternativas qual é a referência bíblica correta. 30
                  segundos por pergunta.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-indigo-900/60 via-blue-800/40 to-purple-900/30"
                borderClassName="border border-indigo-500/40 shadow-[0_0_24px_rgba(99,102,241,0.25)]"
                index={1}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  📈
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Progresso por nível
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  Os versos vão do mais fácil ao mais difícil. Você só avança
                  para o próximo lote quando gabaritar a rodada atual. Errou?
                  Tente quantas vezes quiser.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-amber-900/60 via-orange-800/40 to-pink-900/30"
                borderClassName="border border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                index={2}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  🏅
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Níveis e ranking
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  Conforme acerta, você sobe de nível — Semente, Discípulo,
                  Estudante, Profeta, Lenda Bíblica… e dispute o pódio do
                  ranking acumulado.
                </p>
              </Card>
            </div>
          </Accordion>

          <Accordion
            title="Quizzes da Escola Sabatina"
            emoji="🎯"
            open={openId === 'sabatina'}
            onToggle={() => toggle('sabatina')}
          >
            <div className="text-center mb-8">
              <p className="text-xl text-lavender max-w-3xl mx-auto">
                Um evento especial que vai durar o ano todo! Teste seus
                conhecimentos semanalmente, com base no estudo da lição.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                bgClassName="bg-gradient-to-br from-violet-900/60 via-purple-800/40 to-primary/30"
                borderClassName="border border-violet-500/40 shadow-[0_0_24px_rgba(126,86,134,0.35)]"
                index={0}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  📅
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Duração
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  O evento dura o ano todo, com quizzes semanais baseados na
                  lição da semana.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-indigo-900/60 via-blue-800/40 to-cyan-900/30"
                borderClassName="border border-cyan-500/40 shadow-[0_0_24px_rgba(6,182,212,0.25)]"
                index={1}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  📝
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Formato
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  Cada quiz possui 14 perguntas, sendo 2 perguntas para cada dia
                  da semana.
                </p>
              </Card>

              <Card
                bgClassName="bg-gradient-to-br from-emerald-900/60 via-teal-800/40 to-green-900/30"
                borderClassName="border border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                index={2}
                useScrollReveal={true}
              >
                <div className="text-4xl mb-3 text-center drop-shadow-lg">
                  🏆
                </div>
                <h3 className="text-xl font-bold text-accent mb-2 text-center tracking-wide">
                  Competição
                </h3>
                <p className="text-lavender/90 text-center text-sm leading-relaxed">
                  Participe de todos os quizzes e acumule pontos para subir na
                  classificação geral!
                </p>
              </Card>
            </div>
          </Accordion>
        </div>
      </div>
    </PageTransition>
  )
}
