import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestWithUser } from './interfaces';
import { Response } from 'express';
import { CreateAdminDto } from 'src/user/dto/create-admin.dto';
import { User } from 'src/user/entities/user.entity';
import { LoginAdminDto } from 'src/user/dto/login-admin.dto';
import { UserService } from '../user/user.service';
import { JwtRefreshGuard, LocalAuthGuard } from './guards';
import { AdminGrade } from '../common/enums';
import { AdminState } from '../common/enums';
import { Admin } from '../user/entities';
import _ from 'lodash';

@Controller('auth')
@ApiTags('Web-Auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post('signup')
    @ApiOperation({ summary: '어드민 회원가입', description: '어드민 회원 가입을 진행한다.' })
    @ApiCreatedResponse({ description: '어드민 회원 정보', type: User })
    async adminRegister(@Body() userData: CreateAdminDto): Promise<Admin> {
        return await this.authService.adminRegister(userData);
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: LoginAdminDto })
    @ApiOperation({ summary: '로그인', description: '로그인을 진행한다.' })
    @ApiCreatedResponse({ description: '로그인을 진행한다.', type: User })
    async login(@Req() request: RequestWithUser, @Res({ passthrough: true }) response: Response): Promise<Admin> {
        const { user } = request;
        if (!user) {
            throw new HttpException(`등록되지 않은 계정입니다.`, HttpStatus.FORBIDDEN);
        } else if (user.adminState !== AdminState.ACTIVE) {
            throw new HttpException(`현재 "${user.adminState}" 상태입니다. 관리자에게 문의해주세요.`, HttpStatus.FORBIDDEN);
        } else if (user.grade < AdminGrade.GENERAL) {
            throw new HttpException(`계정 등급 확인이 필요합니다. 관리자에게 문의해주세요.`, HttpStatus.FORBIDDEN);
        }

        const { accessToken, ...accessOption } = this.authService.getCookieWithJwtAccessToken(user);
        const { refreshToken, ...refreshOption } = this.authService.getCookieWithJwtRefreshToken(user);

        await this.userService.setHashedRefreshToken(refreshToken, user);

        response.cookie('Authentication', accessToken, accessOption);
        response.cookie('Refresh', refreshToken, refreshOption);

        return _.assign(user, { Authentication: accessToken, Refresh: refreshToken });
    }

    @Get('refresh')
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: 'refreshToken으로 accessToken을 받는다.', description: 'refreshToken으로 accessToken을 받는다.' })
    @ApiCreatedResponse({ description: 'accessToken을 쿠키에 저장시키고 user 정보를 받는다.', type: User })
    refresh(@Req() request: RequestWithUser, @Res({ passthrough: true }) response: Response): Admin {
        const { user } = request;
        const { accessToken, ...accessOption } = this.authService.getCookieWithJwtAccessToken(user);
        response.cookie('Authentication', accessToken, accessOption);

        return _.assign(user, { Authentication: accessToken });
    }

    @Post('logout')
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: '로그아웃한다.', description: '로그아웃한다.' })
    @ApiCreatedResponse({ description: 'Authentication, Refresh 쿠키를 만료시킨다.' })
    async logout(@Req() request: RequestWithUser, @Res({ passthrough: true }) response: Response): Promise<void> {
        const { user } = request;
        const { accessOption, refreshOption } = this.authService.getCookieForLogout();
        await this.userService.removeRefreshToken(user.userId);

        response.cookie('Authentication', '', accessOption);
        response.cookie('Refresh', '', refreshOption);
    }
}
