import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from "typeorm";
import { Usuario } from '../usuario/usuario.entity';
import { Sala } from '../sala/sala.entity';
import { RolEnSala, EstadoParticipacion, OrigenIngreso } from '../../constants/type';

@Entity('participaciones_sala')
@Unique(['usuario', 'sala'])
export class ParticipacionSala {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Usuario, (user) => user.participacion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @ManyToOne(() => Sala, (sala) => sala.participantes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sala_id' })
    sala: Sala;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'TITULAR',
    })
    rol: RolEnSala;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'PENDIENTE',
    })
    estado: EstadoParticipacion;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: true,
    })
    origenIngreso: OrigenIngreso;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}