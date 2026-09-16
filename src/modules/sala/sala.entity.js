var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, Index } from "typeorm";
import { User } from '../user/user.entity';
import { ParticipacionSala } from '../participacionSala/participacionSala.entity';
let Sala = class Sala {
    id;
    nombre;
    descripcion;
    nombreCancha;
    direccion;
    fechaHoraPartido;
    cuposTotales;
    permiteSuplentes;
    cuposSuplentesMax;
    esPublica;
    tokenInvitacion;
    estado;
    creador;
    participantes;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Sala.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Sala.prototype, "nombre", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Sala.prototype, "descripcion", void 0);
__decorate([
    Column({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Sala.prototype, "nombreCancha", void 0);
__decorate([
    Column({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Sala.prototype, "direccion", void 0);
__decorate([
    Index(),
    Column({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Sala.prototype, "fechaHoraPartido", void 0);
__decorate([
    Column({ type: 'int', default: 10 }),
    __metadata("design:type", Number)
], Sala.prototype, "cuposTotales", void 0);
__decorate([
    Column({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Sala.prototype, "permiteSuplentes", void 0);
__decorate([
    Column({ type: 'int', default: 4 }),
    __metadata("design:type", Number)
], Sala.prototype, "cuposSuplentesMax", void 0);
__decorate([
    Column({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Sala.prototype, "esPublica", void 0);
__decorate([
    Column({ type: 'varchar', length: 64, unique: true }),
    __metadata("design:type", String)
], Sala.prototype, "tokenInvitacion", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
        default: 'ABIERTA',
    }),
    __metadata("design:type", String)
], Sala.prototype, "estado", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.salasCreadas, { onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'creador_id' }),
    __metadata("design:type", User)
], Sala.prototype, "creador", void 0);
__decorate([
    OneToMany(() => ParticipacionSala, (part) => part.sala),
    __metadata("design:type", Array)
], Sala.prototype, "participantes", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Sala.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Sala.prototype, "updatedAt", void 0);
Sala = __decorate([
    Entity('salas')
], Sala);
export { Sala };
