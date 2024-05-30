import {Kafka} from "kafkajs";
import fastify from 'fastify';
import {TgEventsService} from "./services/tgEventsService";

const PORT = process.env.PORT;
const KAFKA_URI = process.env.KAFKA_URI;
const DB_URI = process.env.DB_URI;
const AUTH_SERVICE_URI = process.env.AUTH_SERVICE_URI;
const TG_BOT_KEY = process.env.TG_BOT_KEY;

// if (!TG_BOT_KEY) {
//     throw new Error('TG_BOT_KEY is not defined');
// }
if (!AUTH_SERVICE_URI) {
    throw new Error('AUTH_SERVICE_URI is not defined');
}
if (!DB_URI) {
    throw new Error('DB_URI is not defined');
}
if (!PORT) {
    throw new Error('PORT is not defined');
}
if (!KAFKA_URI) {
    throw new Error('KAFKA_URI is not defined');
}

const bootstrap = async () => {
    // new TgEventsService(TG_BOT_KEY);
    console.log(KAFKA_URI);

    const kafka = new Kafka({
        clientId: 'notify-service',
        brokers: [KAFKA_URI],
    });
    const consumer = kafka.consumer({
        groupId: 'notify-service',
    });
    await consumer.connect();
    await consumer.subscribe({
        topics: ["notify"],
        fromBeginning: false,
    });
    await consumer.run({
        eachMessage: async ({message, topic}) => {
            console.log(`${topic}: ${message.value}`);
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
        // 4. clear sent notifications
    });
    server.listen({port: parseInt(PORT)}, (err, address) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log(`Server started on port ${PORT}`);
    })
}

bootstrap();