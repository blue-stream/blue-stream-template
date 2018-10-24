// <RabbitMQ>
import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';

export class FeatureNameBroker {
    static broker: RabbitMQ = new RabbitMQ('application', 'topic');

    public static async startBrokers() {
        FeatureNameBroker.broker.start();
    }

    public static async subscribe() {
        FeatureNameBroker.broker.subscribe('source.action.status', (message: string) => {
            console.log('example publish message...');
            FeatureNameBroker.broker.publish('Source.Action.Status', `we recieved this: ${message}`);
        });
    }

}
// </RabbitMQ>
