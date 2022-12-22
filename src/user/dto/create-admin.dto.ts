import { ApiProperty } from "@nestjs/swagger";
import { Length, MaxLength, MinLength } from "class-validator";

export class CreateAdminDto {
    @MaxLength(8)
    @ApiProperty({
        description: '이름',
        example: '김지원',
        required: true
    })
    readonly userName: string;

    @ApiProperty({
        description: 'userId',
        example: 'admin',
        required: true
    })
    readonly userId: string;

    @MinLength(4)
    @ApiProperty({
        description: 'password',
        example: 'test',
        required: true
    })
    readonly password: string;

    @Length(11, 11)
    @ApiProperty({
        description: 'phone',
        example: '01047224222',
        required: true
    })
    readonly phone: string;

    @ApiProperty({
        description: 'email',
        example: 'jiwon.k@21market.kr',
        required: true
    })
    readonly email: string;
}
