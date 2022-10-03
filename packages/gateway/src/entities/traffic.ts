import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class TrafficEntity {

  @PrimaryColumn()
  time: string

  @Column()
  realTime: number

  @PrimaryColumn()
  proxyName: string;

  @Column()
  requestCount: number;

  @Column()
  trafficSent: number;

  @Column()
  trafficReceived: number;

}