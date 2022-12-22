import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                //logger: new LoggerQuery(),
                logging: configService.get('NODE_ENV') !== 'production',
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                timezone: '-09:00',
                synchronize: false,
                cache: {
                    type: 'redis',
                    options: {
                        host: configService.get('REDIS_HOST'),
                        port: configService.get('REDIS_PORT'),
                    },
                },
                replication: {
                    master: {
                        host: configService.get('MYSQL_MASTER_HOST'),
                        port: configService.get('MYSQL_MASTER_PORT'),
                        username: configService.get('MYSQL_MASTER_USER'),
                        password: configService.get('MYSQL_MASTER_PASSWORD'),
                        database: configService.get('MYSQL_MASTER_DB'),
                    },
                    slaves: [
                        {
                            host: configService.get('MYSQL_SLAVE_HOST'),
                            port: configService.get('MYSQL_SLAVE_PORT'),
                            username: configService.get('MYSQL_SLAVE_USER'),
                            password: configService.get('MYSQL_SLAVE_PASSWORD'),
                            database: configService.get('MYSQL_SLAVE_DB'),
                        },
                    ],
                },
                namingStrategy: new SnakeNamingStrategy(),
            }),
        }),
    ],
})
export class DatabaseModule {}
