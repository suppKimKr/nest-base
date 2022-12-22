import { ApiProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../common/decorators';

export class UpdateUserDto {
    @ApiProperty({
        description: '회원상태 - 탈퇴회원: true, 정상회원: false',
        required: true,
    })
    @ToBoolean()
    readonly isWithdrawal: boolean;
}
