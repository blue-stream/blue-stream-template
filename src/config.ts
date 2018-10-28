export type Configuration = {
    db: {
        host: string;
        name: string;
        port: number;
    };
    logger: {
        durable: boolean;
        exchangeType: string;
        exchange: string;
        host: string;
        port: number;
        password: string;
        username: string;
        persistent: boolean;
    };
    rabbitMQ: {
        host: string;
        reconnect_timeout: number;
    };
    server: {
        port: number,
        name: string,
    };
    authentication: {
        required: boolean;
        secret: string;
    };
};

export const config: Configuration = {
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-template',
        port: 27017,
    },
    logger: {
        durable: false,
        exchangeType: 'topic' || process.env.RMQ_LOGGER_TYPE,
        exchange: 'blue_stream_logs' || process.env.RMQ_LOGGER_EXCHANGE,
        host: 'localhost' || process.env.RMQ_LOGGER_HOST,
        port: 15672 || process.env.RMQ_LOGGER_PORT,
        password: 'guest' || process.env.RMQ_LOGGER_PASS,
        username: 'guest' || process.env.RMQ_LOGGER_USER,
        persistent: false,
    },
    rabbitMQ: {
        host: process.env.RMQ_HOST || 'localhost',
        reconnect_timeout: 1000,
    },
    server: {
        port: 3000,
        name: 'featureName',
    },
    authentication: {
        required: true,
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
};
