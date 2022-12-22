import { CallHandler, ExecutionContext, HttpStatus, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResponseResult } from '../common.response';
import { instanceToPlain } from 'class-transformer';

export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseResult<T>> {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<ResponseResult<T>> | any {
        return next.handle().pipe(
            map((data) => {
                const { url } = context.getArgByIndex(0);
                switch (url.includes('sweet')) {
                    case true:
                        console.log(instanceToPlain(data));
                        return instanceToPlain(data);
                    default:
                        return new ResponseResult(HttpStatus.OK, data);
                }
            })
        );
    }
}
