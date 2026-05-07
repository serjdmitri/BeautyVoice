import Expo, { ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

// Notification message templates per language
const MESSAGES: Record<string, Record<string, string>> = {
  newTest: {
    en: 'New home test! Earn ${{value}} certificate! We\'ll send samples.',
    ru: 'Новый домашний тест! Заработайте сертификат на ${{value}}!',
    es: '¡Nueva prueba en casa! ¡Gana un certificado de ${{value}}!',
  },
  reminder: {
    en: 'Don\'t forget: {{testTitle}} ends soon!',
    ru: 'Не забудьте: тест «{{testTitle}}» скоро заканчивается!',
    es: 'No olvides: la prueba «{{testTitle}}» termina pronto.',
  },
  completed: {
    en: 'Test completed! You earned a ${{value}} certificate.',
    ru: 'Тест пройден! Вы получили сертификат на ${{value}}.',
    es: '¡Prueba completada! Ganaste un certificado de ${{value}}.',
  },
  topTen: {
    en: '🎉 Weekly Top-10 announcement is live. Check your ranking!',
    ru: '🎉 Еженедельный топ-10 опубликован. Проверьте свой рейтинг!',
    es: '🎉 El Top-10 semanal ya está disponible. ¡Revisa tu posición!',
  },
};

function interpolate(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template
  );
}

export async function sendPushNotifications(
  recipients: Array<{ push_token: string; language: string }>,
  messageKey: string,
  params: Record<string, string>
): Promise<void> {
  const messages: ExpoPushMessage[] = [];

  for (const recipient of recipients) {
    if (!Expo.isExpoPushToken(recipient.push_token)) continue;

    const lang = recipient.language in MESSAGES[messageKey] ? recipient.language : 'en';
    const template = MESSAGES[messageKey]?.[lang] ?? MESSAGES[messageKey]?.['en'] ?? '';
    const body = interpolate(template, params);

    messages.push({
      to: recipient.push_token,
      sound: 'default',
      body,
      data: { messageKey, ...params },
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('Push notification error:', err);
    }
  }
}
