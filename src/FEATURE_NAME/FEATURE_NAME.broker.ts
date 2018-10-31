// <RabbitMQ>
import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';
import * as amqp from 'amqplib';

export class FeatureNameBroker {
    public static async assertExchanges() {
        RabbitMQ.assertExchange('application', 'topic');
    }

    public static async publish(exchange: string,
                                routingKey: string,
                                message: Object,
                                options?: amqp.Options.Publish) {
        RabbitMQ.publish('application', routingKey, message, options);
    }

    public static async subscribe() {
        await RabbitMQ.subscribe('application',
                                 'action-queue',
                                 'source.event.status otherSource.otherEvent.status',
                                 async (message: Object) => {
                                     console.log(`got this message: ${message}`);
                                 });
    }

}
// </RabbitMQ>
