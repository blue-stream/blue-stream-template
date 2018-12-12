// <RabbitMQ>
import * as rabbit from '../utils/rabbit';

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
        'featureName-action-queue',
        'sourceMicroserivce.entity.action.status',
        async (data: any) => { console.log(`got this message: ${data}`); });
    }

}
// </RabbitMQ>
