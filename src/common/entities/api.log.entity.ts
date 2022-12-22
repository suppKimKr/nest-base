import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 500
  })
  requestUrl: string;

  @Column({
    type: 'varchar',
    length: 5
  })
  method: string;

  @Column({type: 'text'})
  parameter: string;

  @Column({
    nullable: true,
    default: null
  })
  response: string;
}