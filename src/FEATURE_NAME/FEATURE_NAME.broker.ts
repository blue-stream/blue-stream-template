// <RabbitMQ>
import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';

export class FeatureNameBroker {
    static rmqReceiver: RabbitMQ = new RabbitMQ(config.rabbitMQ.exchanges.featureNameReceiver);
    static rmqPublisher: RabbitMQ = new RabbitMQ(config.rabbitMQ.exchanges.featureNamePublisher);

    public static startReceiver() {
        FeatureNameBroker.rmqReceiver.startReceiver(FeatureNameBroker.messageHandler);
    }

    public static startPublisher() {
        FeatureNameBroker.rmqPublisher.startPublisher();
    }

    public static publish(message: string) {
        FeatureNameBroker.rmqPublisher.publish(message);
    }

    private static messageHandler(message: string) {
        console.log(message);
    }
}
// </RabbitMQ>
