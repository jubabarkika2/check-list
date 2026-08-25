import { ChecklistSubmission } from '../types';

export function generateWhatsAppMessage(
  submission: ChecklistSubmission,
  restaurantName: string
): string {
  const dateFormatted = new Date(submission.completedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const shiftLabel =
    submission.shift === 'abertura'
      ? '🌅 Abertura'
      : submission.shift === 'turno'
      ? '☀️ Durante o Turno'
      : submission.shift === 'fechamento'
      ? '🌙 Fechamento'
      : '📋 Geral';

  const percentage = Math.round(
    (submission.completedTasks / Math.max(1, submission.totalTasks)) * 100
  );

  let message = `📋 *RELATÓRIO DE CHECKLIST - ${restaurantName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🏢 *Setor:* ${submission.sectorName}\n`;
  message += `👤 *Responsável:* ${submission.staffName || 'Equipe'}\n`;
  message += `⏰ *Turno:* ${shiftLabel}\n`;
  message += `📅 *Data/Hora:* ${dateFormatted}\n`;
  message += `📊 *Progresso:* ${submission.completedTasks}/${submission.totalTasks} tarefas (${percentage}%)\n`;
  message += `📸 *Comprovantes Fotográficos:* ${submission.withPhotoCount} foto(s) anexada(s)\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*DETALHAMENTO DAS TAREFAS:*\n`;

  submission.items.forEach((item, idx) => {
    const statusIcon = item.completed ? '✅' : '❌';
    const photoIcon = item.photoUrl ? ' 📸 [Comprovante OK]' : item.requiresPhoto ? ' ⚠️ [Sem foto]' : '';
    message += `${idx + 1}. ${statusIcon} *${item.title}*${photoIcon}\n`;
    if (item.notes && item.notes.trim()) {
      message += `   └ 💬 _Obs: ${item.notes.trim()}_\n`;
    }
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✨ _Enviado via App de Checklist Operacional_`;

  return message;
}

export function generateWhatsAppLink(
  submission: ChecklistSubmission,
  restaurantName: string,
  managerPhone?: string
): string {
  const message = generateWhatsAppMessage(submission, restaurantName);
  const cleanPhone = managerPhone ? managerPhone.replace(/\D/g, '') : '';

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
