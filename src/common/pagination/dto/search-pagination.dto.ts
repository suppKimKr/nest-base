import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchPaginationDto {
    @Type(() => Number)
    @ApiProperty({
        description: '1페이지 당 보여줄 리스트 개수',
        example: 10,
        required: false,
        default: 10,
    })
    public take: number = 10;

    @Type(() => Number)
    @ApiProperty({
        description: '페이지',
        example: 1,
        required: false,
    })
    public page: number = 1;
}
