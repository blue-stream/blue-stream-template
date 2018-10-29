// <RabbitMQ>
import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';
import * as amqp from 'amqplib';

// put the required RabbitMQ Exchanges over here
RabbitMQ.add(new RabbitMQ('application', 'topic'));
// ----------

export class FeatureNameBroker {

    public static async publish(exchange: string, routingKey: string, message: Object, options?: amqp.Options.Publish) {
        RabbitMQ.exchanges[exchange].publish(routingKey, message, options);
    }

    public static async subscribe() {
        await RabbitMQ.exchanges['application'].subscribe('action-queue', 'source.event.status otherSource..otherEventstatus', async (message: Object) => {
            console.log(`got this message: ${message}`);
        });
    }

}
// </RabbitMQ>
