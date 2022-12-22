import { ApiProperty } from "@nestjs/swagger";
import { AdminState } from "../../common/enums";
import {SearchPaginationDto} from "../../common/pagination/dto/search-pagination.dto";
import { Transform } from "class-transformer";

export class SearchAdminUserDto extends SearchPaginationDto {
    @ApiProperty({
        description: '이름',
        example: '김지원',
        required: false
    })
    public userName: string;

    @Transform(({ value }) => (value === "전체") ? null : value)
    @ApiProperty({
        description: '관리자상태',
        type: 'enum',
        enum: AdminState,
        required: false
    })
    public adminState: AdminState;
}