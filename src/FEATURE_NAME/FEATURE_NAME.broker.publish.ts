// <RabbitMQ>
import * as rabbit from '../utils/rabbit';

export class FeatureNamePublishBroker {
    public static async publish(exchange: string,
                                routingKey: string,
                                message: any) {
        rabbit.publish(exchange, 'topic', routingKey, message);
    }
}
// </RabbitMQ>
