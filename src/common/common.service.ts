import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiLog } from './entities/api.log.entity';
import { RedisClient } from '../utils/redis';
import { ConfigService } from '@nestjs/config';
import { BatchCommandOptions } from './interfaces';

@Injectable()
export class CommonService {
    constructor(
        @InjectRepository(ApiLog)
        private readonly apiLogRepository: Repository<ApiLog>,
        private readonly configService: ConfigService
    ) {}

    async sendToBatch(channel: string, command: BatchCommandOptions) {
        console.log('channel:::::', channel);
        console.log('command:::::', command);
        const redis = new RedisClient(this.configService);
        const redisClient = redis.getConnection();
        redisClient.publish(channel, JSON.stringify(command));
    }
}
