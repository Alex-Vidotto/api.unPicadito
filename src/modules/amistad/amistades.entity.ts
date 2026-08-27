import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { EstadoAmistad } from '../../constants/type';

@Entity('amistades')
@Unique(['solicitante', 'destinatario'])
export class Amistad {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Usuario, (user) => user.solicitudesAmistadEnviadas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'solicitante_id' })
    solicitante: Usuario;

    @ManyToOne(() => Usuario, (user) => user.solicitudesAmistadRecibidas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'destinatario_id' })
    destinatario: Usuario;

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