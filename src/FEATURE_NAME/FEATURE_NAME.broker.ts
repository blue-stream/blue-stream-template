// <RabbitMQ>
import * as rabbit from '../utils/rabbit';
import { config } from '../config';

export class FeatureNameBroker {

    public static async publish(exchange: string,
                                routingKey: string,
                                message: any) {
        rabbit.publish('application', routingKey, message);
    }

    public static async subscribe() {
        rabbit.subscribe(
        'application',
        'topic',
        'FeatureName-action-queue',
        'sourceMicroserivce.entity.action.status',
        async (FeatureName: any) => { console.log(`got this message: ${FeatureName}`); });
    }

}
// </RabbitMQ>
