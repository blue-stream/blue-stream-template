// <RabbitMQ>
import * as rabbit from '../utils/rabbit';

export class FeatureNameSubscribeBroker {
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
