import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export class RedisClient {
    protected host: string;
    protected port: number;
    protected db: number;
    protected connected: boolean;
    protected client: Redis;

    constructor(private readonly configService: ConfigService) {
        this.host = configService.get('REDIS_HOST');
        this.port = configService.get('REDIS_PORT');
        this.db = configService.get('REDIS_DB');
        this.connected = false;
        this.client = null;
    }

    getConnection() {
        if (this.connected) {
            return this.client;
        } else {
            this.client = new Redis({
                host: this.host,
                port: this.port,
                family: 4,
                password: '',
                db: this.db,
            });

            this.connected = true;

            return this.client;
        }
    }
}
