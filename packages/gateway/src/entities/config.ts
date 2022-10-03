import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class ConfigEntity {

  @PrimaryColumn({ unique: true })
  name: string

  @Column()
  value: string;

  @Column({ default: '' })
  desc: string;
}