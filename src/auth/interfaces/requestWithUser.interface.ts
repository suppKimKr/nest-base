import { Request } from 'express'
import { Admin } from "../../user/entities/admin.entity";

export interface RequestWithUser extends Request {
    user: Admin
}
