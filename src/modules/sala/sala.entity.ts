import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, Index } from "typeorm";
import { Usuario } from '../usuario/usuario.entity';
import { ParticipacionSala } from '../participacionSala/participacionSala.entity';
import { EstadoSala } from '../../constants/type';

@Entity('salas')
export class Sala {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'varchar', length: 50 })
    nombreCancha: string;

    @Column({ type: 'varchar', length: 100 })
    direccion: string;

    @Index()
    @Column({ type: 'timestamp' })
    fechaHoraPartido: Date;

    @Column({ type: 'int', default: 10 })
    cuposTotales: number;

    @Column({ type: 'boolean', default: true })
    permiteSuplentes: boolean;

    @Column({ type: 'int', default: 4 })
    cuposSuplentesMax: number;

    @Column({ type: 'boolean', default: true })
    esPublica: boolean;

    @Column({ type: 'varchar', length: 64, unique: true })
    tokenInvitacion: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'ABIERTA',
    })
    estado: EstadoSala;

    @ManyToOne(() => Usuario, (user) => user.salasCreadas, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'creador_id' })
    creador: Usuario;

    @OneToMany(() => ParticipacionSala, (part) => part.sala)
    participantes: ParticipacionSala[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}