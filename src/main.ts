import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { config } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { winstonLoggerOptions } from './common/logger';
import { TrimPipe } from './common/pipes/trim.pipe';
import * as Sentry from '@sentry/node';
import { WebhookInterceptor } from './common/interceptors/webhook.interceptor';
import _ from 'lodash';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: winstonLoggerOptions,
    });
    const configService = app.get(ConfigService);
    config.update({
        accessKeyId: configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        region: configService.get('AWS_REGION'),
    });

    if (_.includes(['development', 'production'], configService.get('NODE_ENV'))) {
        Sentry.init({
            dsn: configService.get('SENTRY_DSN'),
        });
        app.use(Sentry.Handlers.requestHandler({ ip: true, user: ['id'] }));
        app.use(Sentry.Handlers.tracingHandler());
        app.use(
            Sentry.Handlers.errorHandler({
                shouldHandleError(error) {
                    return error.status === 500;
                },
            })
        );
        app.useGlobalInterceptors(new WebhookInterceptor());
    }

    app.use(
        helmet({
            crossOriginResourcePolicy: false,
        })
    );
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
        new TrimPipe()
    );
    app.enableCors({
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        //origin: (process.env.NODE_ENV === 'production' ? configService.get('ACCESS_CONTROL_ALLOW_ORIGINS') : true),
        origin: true,
        credentials: true,
        exposedHeaders: 'Authorization',
    });

    const configBuilder = new DocumentBuilder()
        .setTitle('Nest-Base')
        .setDescription('Admin APIs')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .setExternalDoc('Postman Collection', '/docs-json')
        .build();

    const document = SwaggerModule.createDocument(app, configBuilder);
    SwaggerModule.setup('/docs', app, document, {
        customCss: '.swagger-ui section.models { display: none;}',
    });

    await app.listen(configService.get('PORT'));
    console.log(process.env.NODE_ENV);
}
bootstrap();
