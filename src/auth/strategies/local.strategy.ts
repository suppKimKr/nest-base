import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { Strategy } from "passport-local";
import { Admin } from "../../user/entities/admin.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService
    ) {
        super({
            usernameField: 'userId'
        })
    }
    async validate(userId: string, password: string): Promise<Admin> {
        return this.authService.getAuthedUser(userId, password);
    }
}