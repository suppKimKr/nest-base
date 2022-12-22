import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Biztalk {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
        default: null,
    })
    public caseCode: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true,
        default: null,
    })
    public purpose: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        default: null,
    })
    public tmpltCode: string;

    @Column({
        type: 'text',
        nullable: true,
        default: null,
    })
    public message: string;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
        default: null,
    })
    public buttonType: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        default: null,
    })
    public buttonTitle: string;

    @Column({
        type: 'text',
        nullable: true,
        default: null,
    })
    public buttonLink: string;
}
