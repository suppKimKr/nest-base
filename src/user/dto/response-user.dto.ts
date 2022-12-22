import { User } from '../entities';
import { PartialType } from '@nestjs/swagger';

export class ResponseUserDto extends PartialType(User) {
    readonly stateText: string;
}
