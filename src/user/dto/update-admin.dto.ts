import { PickType } from "@nestjs/swagger";
import { CreateAdminDto } from "./create-admin.dto";

export class UpdateAdminDto extends PickType(CreateAdminDto, ['password', 'phone'] as const) {}