import {Kafka} from "kafkajs";
import fastify from 'fastify';
import {TgEventsService} from "./services/tgEventsService";

const PORT = process.env.PORT;
const KAFKA_URI = process.env.KAFKA_URI;
const AUTH_SERVICE_URI = process.env.AUTH_SERVICE_URI;
const TG_BOT_KEY = process.env.TG_BOT_KEY;

if (!TG_BOT_KEY) {
    throw new Error('TG_BOT_KEY is not defined');
}
if (!AUTH_SERVICE_URI) {
    throw new Error('AUTH_SERVICE_URI is not defined');
}
if (!PORT) {
    throw new Error('PORT is not defined');
}
if (!KAFKA_URI) {
    throw new Error('KAFKA_URI is not defined');
}

interface NotificationModel {
    message: any;
    userId: string;
    timestamp: number;
}

const bootstrap = async () => {
    const tgNotifier = new TgEventsService(TG_BOT_KEY);
    console.log(KAFKA_URI.split(","));

    // basic key-value in-memory db
    const notificationsDb: { [key: string]: any[] } = {};
    const addNotification = (notification: NotificationModel) => {
        tgNotifier.notify(notification.message, notification.userId);
        if (!notificationsDb[notification.userId]) {
            notificationsDb[notification.userId] = [notification];
        } else {
            notificationsDb[notification.userId].push(notification);
        }
    }

    const kafka = new Kafka({
        clientId: 'notify-service',
        brokers: KAFKA_URI.split(","),
    });
    const consumer = kafka.consumer({
        groupId: 'notify',
    });
    await consumer.connect();
    await consumer.subscribe({
        topics: [/notify.*/],
        fromBeginning: false,
    });
    await consumer.run({
        eachMessage: async ({message, topic}) => {
            if (!message.value) {
                console.log("no message provided")
                return;
            }
            const notificationModel = JSON.parse(message.value.toString());
            const notification = notificationModel as NotificationModel;
            switch (true) {
                case /notify.user.*/.test(topic):
                    addNotification(notification);
                    break;
                case /notify.managment_company.*/.test(topic):
                    addNotification(notification);
                    // notify MC
                    break;
                case /notify.*.critical/.test(topic):
                    addNotification(notification);
                    // critically notify MC
                    break;
                default:
                    addNotification(notification);
                    break;
            }
            try {
                if (!message.value) {
                    console.log("error")
                    return;
                }
                addNotification(notification);
                return;
            } catch (e) {
                console.log(e);
            }
        }
    });

    const server = fastify();
    server.get('/notifications', async (req, res) => {
        // 1. get token from header
        const accessHeader = req.headers.authorization;
        if (!accessHeader) {
            res.status(401).send({
                message: 'Unauthorized',
            });
            return;
        }
        const accessToken = accessHeader.split(' ')[1];
        // 2. check token and get user_id and tg_id from auth_service

        // 3. send existing notifications to user
        const userId = 'test'; // getUserId();
        // 4. clear sent notifications
        notificationsDb[userId] = [];
        return notificationsDb[userId];
    });
    server.listen({port: parseInt(PORT), host: "0.0.0.0"}, (err, address) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log(`Server started on port ${PORT}`);
    })
}

bootstrap();