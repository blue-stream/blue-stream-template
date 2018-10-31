import * as amqp from 'amqplib';
import { config } from '../config';

export class RabbitMQ {
    static consumeConnection: amqp.Connection;
    static publishConnection: amqp.Connection;
    static publishChannel: amqp.Channel;

    public static async assertExchange (
        exchange: string,
        type: string,
        options: amqp.Options.AssertExchange = { durable: true },
    ) {
        let channel;
        if (RabbitMQ.consumeConnection) channel = await RabbitMQ.createChannel(RabbitMQ.consumeConnection);
        else channel = await RabbitMQ.createChannel(RabbitMQ.consumeConnection);
        channel.assertExchange(exchange, type, options);
        channel.close();
    }

    public static async connect(select?: string): Promise<void> {
        switch (select) {
        case 'consume':
            RabbitMQ.consumeConnection = await RabbitMQ.createConnection();
            break;
        case 'publish':
            RabbitMQ.publishConnection = await RabbitMQ.createConnection();
            RabbitMQ.publishChannel = await RabbitMQ.createChannel(RabbitMQ.publishConnection);
            break;
        default:
            RabbitMQ.consumeConnection = await RabbitMQ.createConnection();
            RabbitMQ.publishConnection = await RabbitMQ.createConnection();
            RabbitMQ.publishChannel = await RabbitMQ.createChannel(RabbitMQ.publishConnection);
        }
    }

    private static async createConnection(): Promise<amqp.Connection> {

        const connection = await amqp.connect(
            `amqp://${config.rabbitMQ.username}:${config.rabbitMQ.password}@${config.rabbitMQ.host}:${config.rabbitMQ.port}`,
        );

        connection.on('error', (error) => {
            if (error.message !== 'Connection closing') {
                console.error('[RabbitMQ]', error.message);
            }
        });

        console.log('[RabbitMQ] connected');

        return connection;
    }

    private static async createChannel(connection: amqp.Connection) {
        const channel = await connection.createChannel();

        channel.on('error', (error) => {
            console.error('[RabbitMQ Logger] channel error', error.message);
        });

        return channel;
    }

    public static async subscribe(exchange: string, queueName: string,
                                  rawBindingKeys: string | string[],
                                  messageHandler: (message: string) => any,
                                  options: any = { queueOptions : { durable: true }, requeue: false },
        ) {
        const consumeChannel = await RabbitMQ.createChannel(RabbitMQ.consumeConnection);
        if (options.prefetch) consumeChannel.prefetch(options.prefetch);
        let bindingKeys: string[];
        const queue = await consumeChannel.assertQueue(`${config.server.name}-${queueName}`, options.queueOptions);

        if (typeof rawBindingKeys === 'string') bindingKeys = rawBindingKeys.trim().split(' ');
        else bindingKeys = rawBindingKeys;

        bindingKeys.forEach((bindingKey: string) => {
            consumeChannel.bindQueue(queue.queue, exchange, bindingKey);
        });

        consumeChannel.consume(queue.queue, async (message: amqp.Message | null) => {
            try {
                if (message) {
                    const messageContent : string = message.content.toString();
                    await messageHandler(JSON.parse(messageContent));
                }

                consumeChannel.ack(message as amqp.Message);
            } catch (error) {
                consumeChannel.reject(message as amqp.Message, options.requeue);
            }
        },                     { noAck : false });
        return consumeChannel;
    }

    public static publish(exchange: string, routingKey: string, message: string | Object, options: amqp.Options.Publish =
        { persistent: true }) {
        RabbitMQ.publishChannel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), options);
    }

    public static closeConnection() {
        console.log('[RabbitMQ] Connection closed');
        if (RabbitMQ.publishConnection) RabbitMQ.publishConnection.close();
        if (RabbitMQ.consumeConnection) RabbitMQ.consumeConnection.close();
    }
}
