import { CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';
import { CreateAdminDto, SearchUserDto, SearchAdminUserDto, UpdateAdminDto, UpdateUserDto, ResponseUserDto } from './dto';
import { User, Admin } from './entities';
import { Pagination } from '../common/pagination';
import { FilterTypeEnum, AdminGrade, AdminState } from '../common/enums';
import { compare, hash } from 'bcrypt';
import { FilterRequestDto } from '../common/select-box/filter-request.dto';
import { FilterResponse } from '../common/select-box/filter.response';
import { ConfigService } from '@nestjs/config';
import { fnGenerateRedisKey } from '../common/functions';
import { TokenPayload } from '../auth/interfaces';
import _ from 'lodash';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private readonly configService: ConfigService
    ) {}

    async setHashedRefreshToken(refreshToken: string, { id }: Admin): Promise<void> {
        const hashedRefreshToken = await hash(refreshToken, 10);
        const key = fnGenerateRedisKey('Admin', id);
        await this.cacheManager.set(key, hashedRefreshToken, this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'));
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, { id, userId }: TokenPayload): Promise<Admin> {
        const hashedRefreshToken = await this.getHashedRefreshToken(id);
        const isRefreshTokenMatch = hashedRefreshToken ? await compare(refreshToken, hashedRefreshToken) : false;
        if (isRefreshTokenMatch) {
            return this.adminRepository.create({ id, userId });
        }
    }

    async getHashedRefreshToken(id: number): Promise<string> {
        const key = fnGenerateRedisKey('Admin', id);
        return await this.cacheManager.get(key);
    }

    async removeRefreshToken(userId: string): Promise<void> {
        await this.cacheManager.del(userId);
    }

    async getById(id: number): Promise<Admin> {
        const user = await this.adminRepository.findOne({ where: { id } });
        if (user) {
            return user;
        }
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }

    async getByUserId(userId: string): Promise<Admin> {
        const user = await this.adminRepository.findOne({
            where: { userId },
        });
        if (user) {
            return user;
        }
        throw new HttpException('User with this userId does not exist', HttpStatus.NOT_FOUND);
    }

    async createAdmin(adminInput: CreateAdminDto): Promise<Admin> {
        const admin = await this.adminRepository.findOne({
            where: [{ userId: adminInput.userId }, { email: adminInput.email }],
        });

        if (!admin) {
            const newAdmin = this.adminRepository.create({
                ...adminInput,
            });
            return await this.adminRepository.save(newAdmin);
        }

        if (admin.userId === adminInput.userId) throw new HttpException('User with this userId already exist', HttpStatus.BAD_REQUEST);
        if (admin.email === adminInput.email) throw new HttpException('User with this email already exist', HttpStatus.BAD_REQUEST);
    }

    async modifyAdminInfo({ id }: Admin, adminInput: UpdateAdminDto): Promise<Admin> {
        const newAdminUser = this.adminRepository.create({ id, ...adminInput });
        return await this.adminRepository.save(newAdminUser);
    }

    async modifyAdminInfoForSuper(id: number, adminInput: UpdateAdminDto): Promise<Admin> {
        const modifiedUser = this.adminRepository.create({ id, ...adminInput });
        return await this.adminRepository.save(modifiedUser);
    }

    async getAdminUsersWithFilter(searchFilter: SearchAdminUserDto): Promise<Pagination<Admin>> {
        const { userName, adminState, take, page } = searchFilter;
        const [results, total] = await this.adminRepository.findAndCount({
            where: {
                userName: userName ? Like(`%${userName}%`) : Not(In([])),
                adminState: adminState ? adminState : Not(In([])),
            },
            take: take,
            skip: take * (page - 1),
            order: { createdAt: 'DESC' },
        });

        return new Pagination<Admin>({
            results,
            total,
        });
    }

    getFilterResults({ type }: FilterRequestDto): FilterResponse<any> {
        switch (type) {
            case FilterTypeEnum.ADMIN_GRADE:
                return new FilterResponse({ result: AdminGrade });
            case FilterTypeEnum.ADMIN_STATE:
                return new FilterResponse({ result: AdminState });
        }
    }

    async getUsersWithFilter(searchFilter: SearchUserDto): Promise<Pagination<ResponseUserDto>> {
        const { name, phone, isWithdrawal, take, page } = searchFilter;
        const [rows, total] = await this.userRepository.findAndCount({
            where: {
                name: name ? Like(`%${name}%`) : Not(In([])),
                phone: phone ? Like(`%${phone}%`) : Not(In([])),
                isWithdrawal: isWithdrawal !== null ? isWithdrawal : Not(In([])),
            },
            take: take,
            skip: take * (page - 1),
            order: { createdAt: 'DESC' },
        });

        const results = _.map(rows, (value) => _.assign({ ...value, stateText: !value.isWithdrawal ? '정상회원' : '탈퇴회원' }));

        return new Pagination<ResponseUserDto>({
            results,
            total,
        });
    }

    async getUsersWithoutPagination(searchFilter: SearchUserDto): Promise<ResponseUserDto[]> {
        const { name, phone, isWithdrawal } = searchFilter;
        const users = await this.userRepository.find({
            where: {
                name: name ? Like(`%${name}%`) : Not(In([])),
                phone: phone ? Like(`%${phone}%`) : Not(In([])),
                isWithdrawal: isWithdrawal ? isWithdrawal : Not(In([])),
            },
            order: { createdAt: 'DESC' },
        });

        const results = _.map(users, (value) => _.assign({ ...value, stateText: !value.isWithdrawal ? '정상회원' : '탈퇴회원' }));

        return results;
    }

    async getByGeneralUserId(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (user) {
            return _.assign(user, { stateText: !user.isWithdrawal ? '정상회원' : '탈퇴회원' });
        }
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }

    async modifyUserInfo(id: number, adminInput: UpdateUserDto): Promise<User> {
        const { isWithdrawal } = adminInput;
        const modifiedUser = this.userRepository.create({ id, isWithdrawal });
        return await this.userRepository.save({ ...modifiedUser });
    }
}
