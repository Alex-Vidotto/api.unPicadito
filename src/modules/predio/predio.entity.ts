import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Cancha } from "./cancha.entity";

@Entity("predios")
export class Predio {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    nombre: string;

    @Column({ type: "varchar", length: 150 })
    direccion: string;

    @Column({ type: "varchar", length: 80, default: "Posadas, Misiones" })
    localidad: string;

    @Column({ type: "point", srid: 4326 })
    ubicacion: { x: number; y: number };

    @Column({ type: "varchar", length: 30, nullable: true })
    telefono: string | null;

    @Column({ type: "boolean", default: true })
    activo: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Cancha, (cancha) => cancha.predio)
    canchas: Cancha[];
}
