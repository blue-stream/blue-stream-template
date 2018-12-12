// <MongoDB>
import * as mongoose from 'mongoose';
// </MongoDB>
// <RabbitMQ>
import * as rabbit from './utils/rabbit';
// </RabbitMQ>
import { Server } from './server';
import { Logger } from './utils/logger';
import { config } from './config';
import { syslogSeverityLevels } from 'llamajs';

// <RabbitMQ>
import { FeatureNameBroker } from './FEATURE_NAME/FEATURE_NAME.broker';
// </RabbitMQ>

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err.stack);
    // <RabbitMQ>
    rabbit.closeConnection();
    // </RabbitMQ>
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection', err);
    // <RabbitMQ>
    rabbit.closeConnection();
    // </RabbitMQ>
    process.exit(1);
});

process.on('SIGINT', async () => {
    try {
        console.log('User Termination');
        // <MongoDB>
        await mongoose.disconnect();
        // </MongoDB>
        // <RabbitMQ>
        rabbit.closeConnection();
        // </RabbitMQ>
        process.exit(0);
    } catch (error) {
        console.error('Faild to close connections', error);
    }
});

(async () => {
    // <MongoDB>
    await mongoose.connect(
        `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`,
        { useNewUrlParser: true },
    );

    console.log(`[MongoDB] connected to port ${config.db.port}`);
    // </MongoDB>

    // <Logger>
    Logger.configure();
    Logger.log(syslogSeverityLevels.Informational, 'Server Started', `Port: ${config.server.port}`);
    // </Logger>

    // <RabbitMQ>
    await rabbit.connect();
    await FeatureNameBroker.subscribe();
    // </RabbitMQ>

    console.log('Starting server');
    const server: Server = Server.bootstrap();

    server.app.on('close', () => {
        // <RabbitMQ>
        rabbit.closeConnection();
        // </RabbitMQ>
        // <MongoDB>
        mongoose.disconnect();
        // </MongoDB>
        console.log('Server closed');
    });
})();
