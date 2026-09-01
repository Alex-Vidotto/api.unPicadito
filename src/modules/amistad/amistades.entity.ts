import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from '../user/user.entity';
import { EstadoAmistad } from '../../constants/type';

@Entity('amistades')
@Unique(['solicitante', 'destinatario'])
export class Amistad {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.solicitudesAmistadEnviadas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'solicitante_id' })
    solicitante: User;

    @ManyToOne(() => User, (user) => user.solicitudesAmistadRecibidas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'destinatario_id' })
    destinatario: User;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'PENDIENTE',
    })
    estado: EstadoAmistad;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;
}