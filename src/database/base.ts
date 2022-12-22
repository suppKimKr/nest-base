import {BaseEntity, CreateDateColumn, PrimaryGeneratedColumn} from "typeorm";

export class BsEntity extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @CreateDateColumn({ nullable: false })
    createdAt: Date;
}