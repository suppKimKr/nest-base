import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getErrorMessage, reportError } from '../../utils/handleErrors';

export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const { method, url } = context.getArgByIndex(0);
        console.log(`method:::::: ${method}, url:::::: ${url}`);
        return next.handle().pipe(
            tap((body) => {
                if (body) {
                    try {
                        const { data } = body;
                        data ? console.log(JSON.stringify(data)) : console.log('no data');
                    } catch (e) {
                        reportError({ message: getErrorMessage(e) });
                    }
                }
            })
        );
    }
}
