import { sendPushToUsers } from './webPush'

/**
 * Notifica todos os inscritos que um novo quiz está disponível.
 * Falha não bloqueia o fluxo principal.
 */
export async function notifyNewQuizAvailable(
  quizTema: string,
  quizId: number
): Promise<void> {
  try {
    await sendPushToUsers({
      title: 'Novo quiz disponível!',
      body: `O quiz "${quizTema}" está no ar. Participe agora!`,
      url: `/home`,
      tag: `quiz-${quizId}`,
    })
  } catch (err) {
    console.error('[push/notifications] Erro ao notificar novo quiz:', err)
  }
}

/**
 * Notifica todos os inscritos (exceto o respondente) que alguém respondeu o quiz.
 * Mensagem curta e motivadora; usa avatar do respondente como ícone quando disponível.
 */
export async function notifyQuizResponded(
  respondentUserId: number,
  respondentName: string | null,
  respondentAvatarUrl: string | null,
  quizId: number
): Promise<void> {
  try {
    const displayName = respondentName?.trim() || 'Alguém'
    const payload = {
      title: 'Resposta no quiz!',
      body: `${displayName} respondeu! Bora você também?`,
      url: '/home',
      tag: `quiz-responded-${quizId}`,
      ...(respondentAvatarUrl?.trim() ? { icon: respondentAvatarUrl } : {}),
    }
    await sendPushToUsers(payload, undefined, [respondentUserId])
  } catch (err) {
    console.error(
      '[push/notifications] Erro ao notificar resposta no quiz:',
      err
    )
  }
}
