import { Column, Entity, OneToMany } from 'typeorm';
import { BsEntity } from '../../database/base';
import { UserAgreement, UserDelivery, UserInvited } from '../entities';

@Entity()
export class User extends BsEntity {
    @OneToMany(() => UserAgreement, (agreement: UserAgreement) => agreement.user)
    public userAgreements: UserAgreement[];

    @OneToMany(() => UserInvited, (invites: UserInvited) => invites.user)
    public userInvites: UserInvited[];

    @OneToMany(() => UserDelivery, (deliveries: UserDelivery) => deliveries.user)
    public userDeliveries: UserDelivery[];

    @Column({ unique: true })
    public uid: string;

    @Column()
    public email: string;

    @Column()
    public name: string;

    @Column()
    public phone: string;

    @Column({ unique: true })
    public inviteCode: string;

    @Column()
    public ci: string;

    @Column('date')
    public birthday: Date;

    @Column()
    public isWithdrawal: boolean;
}
