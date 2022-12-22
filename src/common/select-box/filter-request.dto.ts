import { ApiProperty } from '@nestjs/swagger';
import { FilterTypeEnum } from '../enums';

export class FilterRequestDto {
    @ApiProperty({
        required: true,
        type: 'enum',
        enum: FilterTypeEnum,
    })
    type: string;
}
