import { ApiProperty } from "@nestjs/swagger";

export class LoginAdminDto {
    @ApiProperty({
        description: 'id',
        example: 'admin'
    })
    public userId: string;

    @ApiProperty({
        description: 'password',
        example: 'test'
    })
    public password: string;
}
