// <RabbitMQ>
import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';

export class FeatureNameService {
    static rmqReceiver: RabbitMQ = new RabbitMQ(config.rabbitMQ.exchanges.featureNameReceiver);
    static rmqPublisher: RabbitMQ = new RabbitMQ(config.rabbitMQ.exchanges.featureNamePublisher);

    public static startReceiver() {
        FeatureNameService.rmqReceiver.startReceiver(FeatureNameService.messageHandler);
    }

    public static startPublisher() {
        FeatureNameService.rmqPublisher.startPublisher();
    }

    public static publish(routingKey: string, message: string) {
        FeatureNameService.rmqPublisher.publish(routingKey, message);
    }

    private static messageHandler(message: string) {
        console.log(message);
    }
}
// </RabbitMQ>
