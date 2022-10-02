import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class ProxyEntity {

    @PrimaryColumn({ unique: true })
    name: string

    @Column()
    type: string

    @Column()
    host: string;

    @Column()
    port: number;

    @Column()
    path: string;

    @Column()
    targetHost: string;

    @Column()
    targetPort: number;

    @Column()
    status: number;

    @Column({ type: 'unsigned big int', default: 0 })
    trafficSent: number;

    @Column({ type: 'unsigned big int', default: 0 })
    trafficReceived: number;
}