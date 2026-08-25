import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Review } from '../review/review.entity.js';

@Entity('usuarios')
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @OneToMany(() => Review, (review) => review.calificador)
    resenasEscritas: Review[];

    @OneToMany(() => Review, (review) => review.calificado)
    resenasRecibidas: Review[];
    
    
    salasCreadas: any[]; 
}
