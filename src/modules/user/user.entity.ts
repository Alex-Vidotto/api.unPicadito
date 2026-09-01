import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import { Amistad } from "../amistad/amistades.entity";
import { PosicionCancha } from "../../constants/type";
import { Sala } from "../sala/sala.entity";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";
import { Review } from "../review/review.entity";

@Entity("usuarios")
export class User {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 100, unique: true })
    email: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    passwordHash: string;

    @Column({ type: "varchar", length: 50, unique: true })
    nombreUsuario: string;

    @Column({ type: "varchar", length: 100 })
    nombre: string;

    @Column({ type: "varchar", length: 100 })
    apellido: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    apodo: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    fotoPerfilUrl: string;

    @Column({ type: "varchar", length: 30, default: "POLIFUNCIONAL" })
    posicionPrincipal: PosicionCancha;

    @Column({ type: "decimal", precision: 3, scale: 2, default: 0.0 })
    reputacion: number;

    @OneToMany(() => Amistad, (amistad) => amistad.solicitante)
    solicitudesAmistadEnviadas: Amistad[];

    @OneToMany(() => Amistad, (amistad) => amistad.destinatario)
    solicitudesAmistadRecibidas: Amistad[];

    @OneToMany(() => Sala, (sala) => sala.creador)
    salasCreadas: Sala[];

    @OneToMany(() => ParticipacionSala, (part) => part.usuario)
    participacion: ParticipacionSala[];

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    @OneToMany(() => Review, (review) => review.calificador)
    resenasEscritas: Review[];

    @OneToMany(() => Review, (review) => review.calificado)
    resenasRecibidas: Review[];


}
