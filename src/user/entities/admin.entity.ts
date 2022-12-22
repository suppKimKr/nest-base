import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AdminState, AdminGrade } from '../../common/enums';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

@Entity()
export class Admin {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        length: 20,
        unique: true,
    })
    public userId: string;

    @Column()
    @Exclude()
    public password: string;

    @Column({
        length: 20,
    })
    public userName: string;

    @Column({
        length: 15,
    })
    public phone: string;

    @Column({ unique: true })
    public email: string;

    @Column({
        type: 'enum',
        enum: AdminGrade,
        default: AdminGrade.GENERAL,
    })
    public grade: AdminGrade;

    @Column({
        type: 'enum',
        enum: AdminState,
        default: AdminState.HOLD,
    })
    public adminState: AdminState;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        try {
            this.password = await bcrypt.hash(this.password, 10);
        } catch (error) {
            throw new InternalServerErrorException('error occurred when hashing passwords');
        }
    }

    async checkPassword(inputPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(inputPassword, this.password);
        } catch (error) {
            throw new BadRequestException('error occurred when checking passwords');
        }
    }
}
