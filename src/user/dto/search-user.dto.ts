import { ApiProperty } from '@nestjs/swagger';
import { SearchPaginationDto } from '../../common/pagination/dto/search-pagination.dto';
import { ToBoolean } from '../../common/decorators';

export class SearchUserDto extends SearchPaginationDto {
    @ApiProperty({
        description: '이름',
        example: '김지원',
        required: false,
    })
    readonly name: string;

    @ApiProperty({
        description: '전화번호',
        example: '01047224222',
        required: false,
    })
    readonly phone: string;

    @ApiProperty({
        description: '회원상태',
        required: false,
    })
    @ToBoolean()
    readonly isWithdrawal: boolean;
}
