import * as amqp from 'amqplib';
import { config } from '../config';

export class RabbitMQ {
    static connection: amqp.Connection;
    
    channel!: amqp.Channel;
    exchange: string = '';
    type: string = '';

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
            const channel = await RabbitMQ.connection.createChannel();

            channel.assertExchange(this.exchange, this.type, { durable: true });

            channel.on('error', (error) => {
                console.error('[RabbitMQ Logger] channel error', error.message);
            });

            channel.on('close', () => {
                console.log('[RabbitMQ Logger] channel closed');
            });


            this.channel = channel;
        }
    }

    public async subscribe(bindingKey: string, messageHandler: (message: string) => void) {
        const queue = await this.channel.assertQueue(config.server.name, { durable: true });
        console.log(`[RabbitMQ] Waiting for messages in ${queue.queue} queue`);
        this.channel.bindQueue(queue.queue, this.exchange, bindingKey);
        this.channel.consume(queue.queue, (message) => {
            messageHandler(message ? message.content.toString() : '');
        });
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
