import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne } from "typeorm"
import { CertEntity } from './cert';

@Entity()
export class StaticServerEntity {

    @PrimaryColumn({ unique: true })
    name: string

    @Column()
    protocol: 'http' | 'https'

    @Column()
    host: string;

    @Column()
    port: number;

    @Column()
    root: string;

    @Column()
    maxAge: number;

    @Column()
    etag: boolean;

    @Column()
    extensions: string;

    @Column()
    status: boolean;

    @Column()
    index: string;

    @ManyToOne((type) => CertEntity, (certEntity) => certEntity.name, { nullable: true })
    cert: CertEntity | null;

    @Column({ type: 'unsigned big int', default: 0 })
    trafficSent: number;

    @Column({ type: 'unsigned big int', default: 0 })
    trafficReceived: number;

    @Column()
    needAuth: boolean;
}