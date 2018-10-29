import * as amqp from 'amqplib';
import { config } from '../config';

export class RabbitMQ {
    static consumeConnection: amqp.Connection;
    static publishConnection: amqp.Connection;
    static exchanges: { [name: string] : RabbitMQ } = {};
    consumeChannel!: amqp.Channel;
    publishChannel!: amqp.Channel;
    exchange: string;
    type: string;
    options: amqp.Options.AssertExchange;
    prefetch!: number;
    requeue: boolean;

    constructor (
        exchange: string,
        type: string,
        options: { exchangeOptions: amqp.Options.AssertExchange, prefetch?: number, requeue: boolean } =
        { exchangeOptions : { durable: true }, requeue: false },
    ) {
        this.exchange = exchange;
        this.type = type;
        this.options = options.exchangeOptions;
        this.requeue = options.requeue;
    }

    public static add(exchange: RabbitMQ) {
        RabbitMQ.exchanges[exchange.exchange] = exchange;
    }

    public static async connect(select?: string): Promise<void> {
        switch (select) {
        case 'consume':
            RabbitMQ.consumeConnection = await RabbitMQ.createConnection();
            break;
        case 'publish':
            RabbitMQ.publishConnection = await RabbitMQ.createConnection();
            break;
        default:
            RabbitMQ.consumeConnection = await RabbitMQ.createConnection();
            RabbitMQ.publishConnection = await RabbitMQ.createConnection();
        }
    }

    private static async createConnection(): Promise<amqp.Connection> {
        const connection = await amqp.connect({
            hostname : `amqp://${config.rabbitMQ.host}`,
            username : config.rabbitMQ.username,
            password : config.rabbitMQ.password,
            port : config.rabbitMQ.port,
        });

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

    public static async startExchanges(): Promise<void> {
        // tslint:disable-next-line:prefer-const
        for (let exchange of Object.keys(RabbitMQ.exchanges) {
            await RabbitMQ.exchanges[exchange].startExchange();
        }
    }

    private async startExchange(): Promise<void> {
        if (RabbitMQ.consumeConnection) {
            this.consumeChannel = await RabbitMQ.createChannel(RabbitMQ.consumeConnection);
            this.consumeChannel.assertExchange(this.exchange, this.type, this.options);
            if (this.prefetch) this.consumeChannel.prefetch(this.prefetch);
        }
        if (RabbitMQ.publishConnection) {
            this.publishChannel = await RabbitMQ.createChannel(RabbitMQ.publishConnection);
            this.publishChannel.assertExchange(this.exchange, this.type, this.options);
        }
    }

    public async subscribe(queueName: string, rawBindingKeys: string | string[], messageHandler: (message: string) => any, queueOptions: amqp.Options.AssertQueue =
    { durable: true }) {
        let bindingKeys: string[];
        const queue = await this.consumeChannel.assertQueue(config.server.name + queueName, queueOptions);

        if (typeof rawBindingKeys === 'string') bindingKeys = rawBindingKeys.trim().split(' ');
        else bindingKeys = rawBindingKeys;

        bindingKeys.forEach((bindingKey: string) => {
            this.consumeChannel.bindQueue(queue.queue, this.exchange, bindingKey);
        });

        this.consumeChannel.consume(queue.queue, async (message: amqp.Message | null) => {
            try {
                if(message) {
                    const messageContent : string = message.content.toString();
                    await messageHandler(JSON.parse(messageContent));
                }
                
                this.consumeChannel.ack(message as amqp.Message);
            } catch (error) {
                this.consumeChannel.reject(message as amqp.Message, this.requeue);
            }
        },                          { noAck : false });
    }

    public publish(routingKey: string, message: string | Object, options: amqp.Options.Publish =
        { persistent: true }) {
        this.publishChannel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(message)), options);
    }

    public static closeConnection() {
        console.log('[RabbitMQ] Connection closed');
        if (RabbitMQ.publishConnection) RabbitMQ.publishConnection.close();
        if (RabbitMQ.consumeConnection) RabbitMQ.consumeConnection.close();
    }
}
