import { RabbitMQ } from './rabbitMQ';
import { config } from '../config';

export enum SeverityType {
    Info        = 'INFO',
    Warning     = 'WARNING',
    Critical    = 'CRITICAL',
}

export enum MessageType {
    Error = 'ERROR',
    Event = 'EVENT',
}

type LogMessage = {
    name: string;
    description: string;
    messageType: MessageType;
    severity: SeverityType;
    serviceName: string;
};

export class Logger {

    static rabbitMQ: RabbitMQ = new RabbitMQ(config.rabbitMQ.exchanges.logger);

    public static start(): Promise<void> {
        return Logger.rabbitMQ.startPublisher();
    }

    public static log(name: string, severity: SeverityType, messageType: MessageType, description: string = '') {
        const logMessage: LogMessage = {
            name,
            description,
            messageType,
            severity,
            serviceName: config.server.name,
        };

        Logger.rabbitMQ.publish('', JSON.stringify(logMessage));
    }
}
