import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserAgreement {
  @ManyToOne(() => User, (user: User) => user.userAgreements)
  @JoinColumn({name: 'fk_user_id', referencedColumnName: 'id'})
  user: User;

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({unique: true})
  section: number;

  @CreateDateColumn()
  createdAt: string;
}