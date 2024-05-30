"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const fastify_1 = __importDefault(require("fastify"));
const PORT = process.env.PORT;
const KAFKA_URI = process.env.KAFKA_URI;
const DB_URI = process.env.DB_URI;
const AUTH_SERVICE_URI = process.env.AUTH_SERVICE_URI;
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
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    const kafka = new kafkajs_1.Kafka({
        clientId: 'notify-service',
        brokers: [KAFKA_URI],
    });
    const consumer = kafka.consumer({
        groupId: 'notify-service',
    });
    yield consumer.connect();
    yield consumer.subscribe({
        topics: ["notify.*"],
        fromBeginning: false,
    });
    yield consumer.run({
        eachMessage: ({ message, topic }) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`${topic}: ${message.value}`);
        })
    });
    const server = (0, fastify_1.default)();
    server.get('/notifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }));
    server.listen({ port: parseInt(PORT) }, (err, address) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log(`Server started on port ${PORT}`);
    });
});
bootstrap();
