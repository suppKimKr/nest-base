import { Body, Controller, Get, Header, Param, ParseIntPipe, Patch, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RequestWithUser } from '../auth/interfaces';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, Admin } from './entities';
import { UpdateAdminDto, SearchUserDto, SearchAdminUserDto, UpdateUserDto, ResponseUserDto } from './dto';
import { RoleGuard } from '../auth/guards';
import { AdminGrade, AdminState } from '../common/enums';
import { Response } from 'express';
import { FilesService } from 'src/files/files.service';
import { FilterRequestDto } from '../common/select-box/filter-request.dto';
import { UpdateResult } from 'typeorm';
import { Pagination } from '../common/pagination';

@Controller('manage')
@ApiTags('User CRUD Api')
export class UserController {
    constructor(private readonly userService: UserService, private readonly filesService: FilesService) {}

    @Get('user')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @ApiOperation({ summary: '일반 회원정보 페이징 및 필터 목록조회', description: '일반 회원정보 목록을 조회한다.' })
    @ApiCreatedResponse({ description: '일반 회원정보 목록을 조회한다.', type: User })
    async getUsers(@Query() searchFilter: SearchUserDto): Promise<Pagination<ResponseUserDto>> {
        return await this.userService.getUsersWithFilter(searchFilter);
    }

    @Get('user/excel')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=users.xlsx')
    @ApiOperation({ summary: '일반 회원정보 리스트 엑셀 다운로드', description: '일반 회원정보 리스트 .xlsx 파일로 다운로드한다.' })
    @ApiCreatedResponse({ description: '일반 회원정보 리스트 .xlsx 파일로 다운로드한다.', type: User })
    async getUsersToExcel(@Query() searchFilter: SearchUserDto, @Res() response: Response) {
        const users: ResponseUserDto[] = await this.userService.getUsersWithoutPagination(searchFilter);
        const file: string = this.filesService.createExcel(users, 'users');
        response.end(Buffer.from(file, 'base64'));
    }

    /** 현정 추가 */
    @Get('user/:id')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @ApiOperation({ summary: '일반유저 회원 상세정보조회', description: '어드민 회원관리 > 일반유저 > 상세조회' })
    @ApiCreatedResponse({ description: '어드민 회원관리 > 일반유저 > 상세조회', type: User })
    async getGeneralUserByUserId(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.getByGeneralUserId(id);
    }

    @Patch('user/:id')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @ApiOperation({ summary: '일반유저 회원정보 수정', description: '일반유저 회원정보를 수정한다.' })
    @ApiCreatedResponse({ description: '일반유저 회원정보를 수정한다.', type: User })
    async modifyGeneralUserInfo(@Param('id', ParseIntPipe) id: number, @Body() userInput: UpdateUserDto) {
        return await this.userService.modifyUserInfo(id, userInput);
    }

    @Get('list')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @ApiOperation({ summary: '관리자 회원정보 페이징 및 필터 목록조회', description: '관리자 회원정보 목록을 조회한다.' })
    @ApiCreatedResponse({ description: '관리자 회원정보 목록을 조회한다.', type: User })
    async getAdminUsers(@Query() searchFilter: SearchAdminUserDto): Promise<Pagination<Admin>> {
        return await this.userService.getAdminUsersWithFilter(searchFilter);
    }

    @Get('filter')
    @ApiOperation({ summary: '관리자 회원상태값 리스트 조회', description: '관리자 회원상태값 리스트를 조회한다.' })
    @ApiCreatedResponse({ description: '관리자 회원상태값 리스트를 조회한다.', type: Object, isArray: true })
    getAdminUserStateLists(@Query() filter: FilterRequestDto) {
        return this.userService.getFilterResults(filter);
    }

    @Get('my')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @ApiOperation({ summary: '관리자 본인정보조회', description: '관리자 본인정보조회' })
    @ApiCreatedResponse({ description: '회원 본인정보조회', type: User })
    async getAdminMyInfo(@Req() request: RequestWithUser) {
        const { user } = request;
        return await this.userService.getByUserId(user.userId);
    }

    @Get(':id')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @ApiOperation({ summary: '관리자 상세정보조회', description: '회원관리 > 유저 > 상세조회' })
    @ApiCreatedResponse({ description: '회원관리 > 유저 > 상세조회', type: User })
    async getUserByUserId(@Param('id', ParseIntPipe) id: number): Promise<Admin> {
        return await this.userService.getById(id);
    }

    @Patch('my')
    @UseGuards(RoleGuard(AdminGrade.GENERAL))
    @ApiBody({
        type: UpdateAdminDto,
        examples: {
            a: {
                value: { password: '패스워드', phone: '연락처' },
            },
        },
    })
    @ApiOperation({ summary: '관리자 본인 회원정보 수정', description: '관리자 본인 회원정보를 수정한다.' })
    @ApiCreatedResponse({ description: '관리자 본인 회원정보를 수정한다.', type: UpdateResult })
    async modifyAdminMyInfo(@Req() { user }: RequestWithUser, @Body() adminInput: UpdateAdminDto) {
        return await this.userService.modifyAdminInfo(user, adminInput);
    }

    @Patch(':id')
    @UseGuards(RoleGuard(AdminGrade.SUPER))
    @ApiBody({
        type: UpdateAdminDto,
        examples: {
            a: {
                summary: "{ adminState: 'active' }",
                value: { adminState: AdminState },
            },
        },
    })
    @ApiOperation({ summary: '슈퍼계정 권한 - 관리자 레벨 및 상태 수정', description: '관리자 레벨 및 상태를 수정한다.' })
    @ApiCreatedResponse({ description: '관리자 레벨 및 상태를 수정한다.', type: User })
    async modifyAdminInfoForSuper(@Param('id', ParseIntPipe) id: number, @Body() admin: UpdateAdminDto) {
        return await this.userService.modifyAdminInfoForSuper(id, admin);
    }
}
