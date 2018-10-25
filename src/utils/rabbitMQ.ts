import * as amqp from 'amqplib';
import { config } from '../config';

export class RabbitMQ {
    static connection: amqp.Connection;
    channel!: amqp.Channel;
    exchange: string;
    type: string;

    constructor (exchange: string, type: string) {
        this.exchange = exchange;
        this.type = type;
    }

    public static async connect() {
        const connection = await amqp.connect(`amqp://${config.rabbitMQ.host}`);
        connection.on('error', (error) => {
            if (error.message !== 'Connection closing') {
                console.error('[RabbitMQ]', error.message);
            }
        });

        connection.on('close', () => {
            console.error('[RabbitMQ] reconnecting');

            return setTimeout(this.connect, config.rabbitMQ.reconnect_timeout);
        });

        console.log('[RabbitMQ] connected');

        RabbitMQ.connection = connection;

        return connection;
    }

    public async start() {
        if (!RabbitMQ.connection) {
            throw new Error('[RabbitMQ] connection is not open');
        } else {
            this.channel = await RabbitMQ.connection.createChannel();

            this.channel.assertExchange(this.exchange, this.type, { durable: true });

            this.channel.on('error', (error) => {
                console.error('[RabbitMQ Logger] channel error', error.message);
            });

            this.channel.on('close', () => {
                console.log('[RabbitMQ Logger] channel closed');
            });

        }
    }

    public async subscribe(queueName: string, bindingKey: string, messageHandler: (message: string) => void, prefetch ?: number) {
        const queue = await this.channel.assertQueue(config.server.name + queueName, { durable: true });
        if (prefetch) this.channel.prefetch(prefetch);
        console.log(`[RabbitMQ] Waiting for messages in ${queue.queue} queue`);
        this.channel.bindQueue(queue.queue, this.exchange, bindingKey);
        this.channel.consume(queue.queue, async (message: amqp.Message | null) => {
            await messageHandler(message ? message.content.toString() : '');
            this.channel.ack(message as amqp.Message);
        },                   { noAck : false });
    }

    publish(routingKey: string, message: string) {
        try {
            this.channel.publish(this.exchange, routingKey, Buffer.from(message), { persistent: true });
        } catch (error) {
            console.error('[RabbitMQ Logger]', error.message);
        }
    }

    public static closeConnection() {
        console.log('[RabbitMQ] Connection closed');
        RabbitMQ.connection.close();
    }
}
