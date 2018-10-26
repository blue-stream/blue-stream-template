import * as amqp from 'amqplib';
import { config } from '../config';

export class RabbitMQ {
    static consumeConnection: amqp.Connection;
    static publishConnection: amqp.Connection;
    consumeChannel!: amqp.Channel;
    publishChannel!: amqp.Channel;
    exchange: string;
    type: string;
    options: amqp.Options.AssertExchange;
    prefetch!: number;

    constructor (
        exchange: string, 
        type: string, 
        options: { exchangeOptions: amqp.Options.AssertExchange, prefetch?: number  } = { exchangeOptions : {durable: true} }
    ) {
        this.exchange = exchange;
        this.type = type;
        this.options = options.exchangeOptions;
    }

    public static async connect(): Promise<void> {
        RabbitMQ.consumeConnection = await RabbitMQ.createConnection();
        RabbitMQ.publishConnection = await RabbitMQ.createConnection();
    }

    private static async createConnection(): Promise<amqp.Connection> {
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

        return connection;
    }

    private static async createChannel(connection: amqp.Connection) {
        const channel = await connection.createChannel();

        channel.on('error', (error) => {
            console.error('[RabbitMQ Logger] channel error', error.message);
        });

        channel.on('close', () => {
            console.log('[RabbitMQ Logger] channel closed');
        });

        return channel;
    }

    public async start(): Promise<void> {
        this.consumeChannel = await RabbitMQ.createChannel(RabbitMQ.consumeConnection);
        if (this.prefetch) this.consumeChannel.prefetch(this.prefetch);
        this.publishChannel = await RabbitMQ.createChannel(RabbitMQ.publishConnection);
        this.publishChannel.assertExchange(this.exchange, this.type, this.options);
    }
    
    public async subscribe(queueName: string, bindingKeys: string | Array<string>, messageHandler: (message: string) => any, queueOptions: amqp.Options.AssertQueue = {durable: true}) {
        const queue = await this.consumeChannel.assertQueue(config.server.name + queueName, queueOptions);
        
        if (typeof bindingKeys == 'string') bindingKeys = bindingKeys.split(' ');
        bindingKeys.forEach( (bindingKey: string) => {
            this.consumeChannel.bindQueue(queue.queue, this.exchange, bindingKey);
        });
        
        this.consumeChannel.consume(queue.queue, async (message: amqp.Message | null) => {
            try {
                await messageHandler(message ? message.content.toString() : '');
                this.consumeChannel.ack(message as amqp.Message);
            } catch (error) {
                this.consumeChannel.reject(message as amqp.Message);
            }
        }, { noAck : false });
    }

    public publish(routingKey: string, message: string, options: amqp.Options.Publish = {persistent: true}) {
        this.publishChannel.publish(this.exchange, routingKey, Buffer.from(message),options);
    }

    public static closeConnection() {
        console.log('[RabbitMQ] Connection closed');
        RabbitMQ.publishConnection.close();
        RabbitMQ.consumeConnection.close();
    }
}
