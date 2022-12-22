import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
import { sendSlack } from '../functions';

@Injectable()
export class WebhookInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        dotenv.config({ path: `config/.env.${process.env.NODE_ENV}` });
        return next.handle().pipe(
            catchError((error) => {
                Sentry.captureException(error);
                const channel = process.env.NODE_ENV === 'production' ? process.env.SLACK_WEBHOOK_URL : process.env.SLACK_WEBHOOK_DEV_REPORT;
                sendSlack(channel, {
                    color: 'danger',
                    text: `🚨 nest-base-api-${process.env.NODE_ENV} 🚨`,
                    fields: [
                        {
                            title: `Request Message: ${error.message}`,
                            value: error.stack,
                            short: false,
                        },
                    ],
                    thumb_url: null,
                });
                throw new HttpException(error.message, error.status);
            })
        );
    }
}
