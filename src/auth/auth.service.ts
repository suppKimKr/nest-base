import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {CreateAdminDto} from 'src/user/dto/create-admin.dto';
import {UserService} from 'src/user/user.service';
import {TokenPayload} from "./interfaces";
import { Admin } from "../user/entities/admin.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async adminRegister(adminData: CreateAdminDto): Promise<Admin> {
    return await this.userService.createAdmin(adminData);
  }

  async getAuthedUser(userId: string, plainTextPassword: string) {
      const user = await this.userService.getByUserId(userId);
      if (!await user.checkPassword(plainTextPassword)) throw new HttpException('잘못된 비밀번호입니다. 비밀번호를 확인해주세요.', HttpStatus.BAD_REQUEST);
      return user;
  }
  
  getCookieWithJwtAccessToken({ id, userId }: Admin) {
    const payload: TokenPayload = { id, userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    });

    return {
      accessToken: token,
      domain: this.configService.get('AUTH_DOMAIN'),
      path: '/',
      httpOnly: true,
      maxAge: Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')) * 1000,
      sameSite: this.configService.get('SAME_SITE_OPTION'),
      secure: true
    }
  }

  getCookieWithJwtRefreshToken({ id, userId }: Admin) {
    const payload: TokenPayload = { id, userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`
    });

    return {
      refreshToken: token,
      domain: this.configService.get('AUTH_DOMAIN'),
      path: '/',
      httpOnly: true,
      maxAge: Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')) * 1000,
      sameSite: this.configService.get('SAME_SITE_OPTION'),
      secure: true
    }
  }

  getCookieForLogout() {
    return {
      accessOption: {
        domain: this.configService.get('AUTH_DOMAIN'),
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: this.configService.get('AUTH_DOMAIN'),
        path: '/',
        httpOnly: true,
        maxAge: 0,
      }
    }
  }

}
