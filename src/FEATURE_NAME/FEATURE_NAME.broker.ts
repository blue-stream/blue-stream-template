// <RabbitMQ>
import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';

export class FeatureNameBroker {
    static appExchange: RabbitMQ = new RabbitMQ('application', 'topic');

    public static async start() {
        await FeatureNameBroker.appExchange.start();
    }

    public static async subscribe() {
        await FeatureNameBroker.appExchange.subscribe('action-queue', 'entity.event.status', async (message: string) => {
            console.log('example publish message...');
            FeatureNameBroker.appExchange.publish('entity.event.status', `we recieved this: ${message}`);
        });
    }

}
// </RabbitMQ>
