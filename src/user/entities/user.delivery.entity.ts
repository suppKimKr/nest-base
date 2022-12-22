import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BsEntity } from '../../database/base';
import { User } from './user.entity';

@Entity()
export class UserDelivery extends BsEntity {
    @ManyToOne(() => User, (user: User) => user.userDeliveries)
    @JoinColumn({ name: 'fk_user_id', referencedColumnName: 'id' })
    public user: User;

    @Column()
    public addressHead: string;

    @Column({
        length: 400,
    })
    public addressDetail: string;

    @Column({
        length: 10,
    })
    public postCode: string;

    @Column({
        length: 500,
    })
    public memo: string;
}
