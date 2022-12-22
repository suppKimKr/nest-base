import { HttpStatus } from '@nestjs/common';
import { Exclude, Expose, instanceToPlain } from 'class-transformer';
import _ from 'lodash';

export class ResponseResult<T> {
    @Exclude() private readonly statusCode: number;
    @Exclude() private readonly message: string;
    @Exclude() private readonly data: Record<string, any>;

    constructor(status: number, data: T) {
        this.statusCode = status;
        this.message = HttpStatus[status];
        // @ts-ignore
        this.data = data ? (typeof data === 'object' && !_.size(data) ? null : instanceToPlain(data)) : null;
    }

    @Expose()
    get getStatusCode(): number {
        return this.statusCode;
    }

    @Expose()
    get getMessage(): string {
        return this.message;
    }

    @Expose()
    get getData(): Record<string, any> {
        return this.data;
    }
}
