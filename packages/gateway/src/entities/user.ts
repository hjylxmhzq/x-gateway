import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class UserEntity {

  @PrimaryColumn({ unique: true })
  name: string

  @Column()
  password: string;

  @Column()
  tags: string;

  @Column({ type: 'boolean', default: false })
  needTwoFacAuth: boolean;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ default: '' })
  email: string;

  @Column()
  lastLogin: number;

  @Column()
  createdAt: number;
}