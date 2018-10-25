// <RabbitMQ>
import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';

export class FeatureNameBroker {
    static broker: RabbitMQ = new RabbitMQ('application', 'topic');

    public static async startBrokers() {
        await FeatureNameBroker.broker.start();
    }

    public static async subscribe() {
        await FeatureNameBroker.broker.subscribe('action-queue', 'entity.event.status', async (message: string) => {
            console.log('example publish message...');
            FeatureNameBroker.broker.publish('entity.event.status', `we recieved this: ${message}`);
        });
    }

}
// </RabbitMQ>
