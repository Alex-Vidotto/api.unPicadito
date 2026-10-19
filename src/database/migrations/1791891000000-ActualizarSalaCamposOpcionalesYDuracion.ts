import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ActualizarSalaCamposOpcionalesYDuracion1728800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
    
        await queryRunner.changeColumn("salas", "nombreCancha", new TableColumn({
            name: "nombreCancha",
            type: "varchar",
            length: "50",
            isNullable: true,
        }));

        await queryRunner.changeColumn("salas", "direccion", new TableColumn({
            name: "direccion",
            type: "varchar",
            length: "100",
            isNullable: true,
        }));

        await queryRunner.addColumn("salas", new TableColumn({
            name: "duracionMinutos",
            type: "int",
            default: 60,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("salas", "duracionMinutos");
        
        await queryRunner.changeColumn("salas", "direccion", new TableColumn({
            name: "direccion", type: "varchar", length: "100", isNullable: false
        }));
        await queryRunner.changeColumn("salas", "nombreCancha", new TableColumn({
            name: "nombreCancha", type: "varchar", length: "50", isNullable: false
        }));
    }
}