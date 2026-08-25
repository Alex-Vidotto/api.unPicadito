import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('salas')
export class Sala {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'timestamp' })
    date: Date;
}
