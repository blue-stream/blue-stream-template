import * as llama from 'llamajs';

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

    public static log(message: llama.LogMessage) {
        const rabbitMqTopicKey: string = `${message.severity}.${message.name}`;
        Logger.logger.log(message, { routingKey: rabbitMqTopicKey } as llama.RabbitMqMessageConfig);
    }

}
