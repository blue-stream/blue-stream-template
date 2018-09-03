export type Configuration = {
    db: {
        host: string;
        name: string;
        port: number;
    },
    rabbitMQ: {
        host: string;
        exchanges: {
            logger: string;
            featureNameReceiver: string;
            featureNamePublisher: string;
        };
        reconnect_timeout: number;
    }
    server: {
        port: number,
        name: string,
    },
    authentication: {
        required: boolean;
        secret: string;
    };
};

const development: Configuration = {
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-template',
        port: 27017,
    },
    rabbitMQ: {
        host: 'localhost',
        exchanges: {
            logger: 'logs',
            featureNameReceiver: 'featureName',
            featureNamePublisher: 'featureName',
        },
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

const production: Configuration = {
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-template',
        port: 27017,
    },
    rabbitMQ: {
        host: 'localhost',
        exchanges: {
            logger: 'logs',
            featureNameReceiver: 'featureName',
            featureNamePublisher: 'featureName',
        },
        reconnect_timeout: 1000,
    },
    server: {
        port: process.env.PORT ? +process.env.PORT : 3000,
        name: 'featureName',
    },
    authentication: {
        required: true,
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
};

const test: Configuration = {
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-template-test',
        port: 27017,
    },
    rabbitMQ: {
        host: 'localhost',
        exchanges: {
            logger: 'logs',
            featureNameReceiver: 'featureName',
            featureNamePublisher: 'featureName',
        },
        reconnect_timeout: 1000,
    },
    server: {
        port: process.env.PORT ? +process.env.PORT : 3000,
        name: 'featureName',
    },
    authentication: {
        required: true,
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
};

const configuration: { [index: string]: Configuration } = {
    development,
    production,
    test,
};

export const config = configuration[process.env.NODE_ENV || 'development'];
