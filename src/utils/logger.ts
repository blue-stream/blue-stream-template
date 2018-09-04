import * as llama from 'llamajs';
import { config } from '../config';

interface LogMessage extends llama.LogMessage {
    timestamp: Date;
    description: string;
    hostname: string;
}

export class Logger {
    private static logger: llama.Logger;

    public static configure() {
        const rabbitTransport: llama.RabbitMqTransport = new llama.RabbitMqTransport({
            durable: false,
            exchanegType: 'topic',
            exchange: 'blue_stream_logs',
            format: new llama.JsonFormat({}),
            host: 'localhost',
            port: 15672,
            levels: [
                llama.syslogSeverityLevels.Informational,
                llama.syslogSeverityLevels.Warning,
                llama.syslogSeverityLevels.Error,
                llama.syslogSeverityLevels.Emergency,
            ],
            password: 'guest',
            username: 'guest',
            persistent: false,
        } as llama.RabbitMqConfig);

        const config: llama.LoggerConfig = {
            levels: llama.syslogSeverityLevels,
            transports: [rabbitTransport],
        };

        Logger.logger = new llama.Logger(config);
    }

    public static log(severity: llama.SeverityLevel, name: string, description: string) {
        const message: LogMessage = {
            severity,
            name,
            description,
            timestamp: new Date(),
            hostname: config.server.name,
        };
        const rabbitMqTopicKey: string = `${message.severity}.${message.name}.${message.hostname}`;

        Logger.logger.log(message, { routingKey: rabbitMqTopicKey } as llama.RabbitMqMessageConfig);
    }
}
