import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class CertEntity {

    @PrimaryColumn({ unique: true })
    name: string

    @Column()
    domain: string

    @Column()
    key: string;

    @Column()
    cert: string;

    @Column()
    createdAt: number;

    @Column()
    createdBy: string;

    @Column()
    useForWebClient: number;
}