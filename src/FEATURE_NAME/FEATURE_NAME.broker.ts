// <RabbitMQ>
import * as rabbit from 'rabbit-lite';
import * as amqp from 'amqplib';
import { config } from '../config';

export class FeatureNameBroker {
    public static async assertExchanges() {
        await rabbit.assertExchange('application', 'topic');
    }

    public static async publish(exchange: string,
                                routingKey: string,
                                message: Object,
                                options?: amqp.Options.Publish) {
        rabbit.publish('application', routingKey, message, options);
    }

    public static async subscribe() {
        await rabbit.subscribe('FeatureName-action-queue',
                               { exchange : 'application', pattern : 'source.event.status' },
                               async (message: Object) => { console.log(`got this message: ${message}`); });
    }

}
// </RabbitMQ>
