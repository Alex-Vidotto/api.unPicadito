import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Predio } from "./predio.entity";
import { Sala } from "../sala/sala.entity";
import { TipoFutbol, TipoSuperficie, TIPO_FUTBOL, TIPO_SUPERFICIE } from "../../constants/type";

@Entity("canchas")
export class Cancha {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 60 })
    nombre: string;

    @Column({ type: "varchar", length: 20, default: TIPO_FUTBOL.FUTBOL_5 })
    tipoFutbol: TipoFutbol;

    @Column({ type: "varchar", length: 20, default: TIPO_SUPERFICIE.SINTETICO })
    superficie: TipoSuperficie;

    @Column({ type: "boolean", default: false })
    techada: boolean;

    @Column({ type: "boolean", default: true })
    iluminacion: boolean;

    @Column({ type: "int", default: 10 })
    cuposRecomendados: number;

    @Column({ type: "boolean", default: true })
    activa: boolean;

    @ManyToOne(() => Predio, (predio) => predio.canchas, { onDelete: "CASCADE" })
    @JoinColumn({ name: "predio_id" })
    predio: Predio;

    @OneToMany(() => Sala, (sala) => sala.cancha)
    salas: Sala[];
}
