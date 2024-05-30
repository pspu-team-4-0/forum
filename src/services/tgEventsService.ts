import TelegramBot from 'node-telegram-bot-api';

export class TgEventsService {
    private bot: TelegramBot | null;

    constructor(apiKey: string) {
        this.bot = new TelegramBot(apiKey, {
            polling: true
        });
        this.bot.on("polling_error", (err) => console.log(err));
        this.bot.onText(/\/start/, async (msg) => {
            try {
                await this.bot?.sendMessage(
                    msg.chat.id,
                    `
Привет!
Ты собираешься подписаться на уведомления об использовании счетчиков.
Подтверди свои действия, выполнив вход с помощью аккаунта ujin.
                    `);
            } catch (e) {
                console.log(e);
            }
        });
        // this.bot.onText();
    }

}