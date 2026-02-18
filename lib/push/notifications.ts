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
