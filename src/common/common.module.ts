import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Biztalk } from './entities/biztalk.entity';
import { UserModule } from '../user/user.module';
import { ApiLog } from './entities/api.log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Biztalk, ApiLog]), UserModule],
    providers: [CommonService],
    exports: [CommonService],
})
export class CommonModule {}
