var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Amistad } from "../amistad/amistades.entity";
import { Sala } from "../sala/sala.entity";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";
import { Review } from "../review/review.entity";
let User = class User {
    id;
    email;
    passwordHash;
    nombreUsuario;
    nombre;
    apellido;
    apodo;
    fotoPerfilUrl;
    posicionPrincipal;
    reputacion;
    solicitudesAmistadEnviadas;
    solicitudesAmistadRecibidas;
    salasCreadas;
    participacion;
    creadoEn;
    actualizadoEn;
    resenasEscritas;
    resenasRecibidas;
};
__decorate([
    PrimaryGeneratedColumn("increment"),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", length: 100, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: "varchar", length: 100, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    Column({ type: "varchar", length: 50, unique: true }),
    __metadata("design:type", String)
], User.prototype, "nombreUsuario", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], User.prototype, "nombre", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], User.prototype, "apellido", void 0);
__decorate([
    Column({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "apodo", void 0);
__decorate([
    Column({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "fotoPerfilUrl", void 0);
__decorate([
    Column({ type: "varchar", length: 30, default: "POLIFUNCIONAL" }),
    __metadata("design:type", String)
], User.prototype, "posicionPrincipal", void 0);
__decorate([
    Column({ type: "decimal", precision: 3, scale: 2, default: 0.0 }),
    __metadata("design:type", Number)
], User.prototype, "reputacion", void 0);
__decorate([
    OneToMany(() => Amistad, (amistad) => amistad.solicitante),
    __metadata("design:type", Array)
], User.prototype, "solicitudesAmistadEnviadas", void 0);
__decorate([
    OneToMany(() => Amistad, (amistad) => amistad.destinatario),
    __metadata("design:type", Array)
], User.prototype, "solicitudesAmistadRecibidas", void 0);
__decorate([
    OneToMany(() => Sala, (sala) => sala.creador),
    __metadata("design:type", Array)
], User.prototype, "salasCreadas", void 0);
__decorate([
    OneToMany(() => ParticipacionSala, (part) => part.usuario),
    __metadata("design:type", Array)
], User.prototype, "participacion", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "creadoEn", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "actualizadoEn", void 0);
__decorate([
    OneToMany(() => Review, (review) => review.calificador),
    __metadata("design:type", Array)
], User.prototype, "resenasEscritas", void 0);
__decorate([
    OneToMany(() => Review, (review) => review.calificado),
    __metadata("design:type", Array)
], User.prototype, "resenasRecibidas", void 0);
User = __decorate([
    Entity("usuarios")
], User);
export { User };
