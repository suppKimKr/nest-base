import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserInvited {
  @ManyToOne(() => User, (user: User) => user.userInvites)
  @JoinColumn({name: 'fk_user_id', referencedColumnName: 'id'})
  user: User;

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 10 })
  inviteCode: string;

  @CreateDateColumn()
  createdAt: string;
}