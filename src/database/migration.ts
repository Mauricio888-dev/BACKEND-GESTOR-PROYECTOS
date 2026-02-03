import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1670000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // TABLA EMPRESAS
    await queryRunner.query(`
      CREATE TABLE empresas (
        id_empresa INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    // TABLA PROYECTOS
    await queryRunner.query(`
      CREATE TABLE proyectos (
        id_proyecto INT PRIMARY KEY AUTO_INCREMENT,
        id_empresa INT NOT NULL,
        nombre_proyecto VARCHAR(255) NOT NULL,
        FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
      );
    `);

    // TABLA TEMAS
    await queryRunner.query(`
      CREATE TABLE temas (
        id_tema INT PRIMARY KEY AUTO_INCREMENT,
        id_proyecto INT NOT NULL,
        nombre_tema VARCHAR(255) NOT NULL,
        estado ENUM('realizado','sin registro','en proceso') DEFAULT 'sin registro',
        descripcion TEXT,
        FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto)
      );
    `);

    // TABLA USUARIOS
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id_usuario INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        rol ENUM('admin','implementador','cliente') NOT NULL
      );
    `);

    // TABLA HISTORIAL_TEMA
    /*await queryRunner.query(`
      CREATE TABLE historial_tema (
        id_historial INT PRIMARY KEY AUTO_INCREMENT,
        id_tema INT NOT NULL,
        id_usuario INT NOT NULL,
        estado ENUM('realizado','sin registro','en proceso') NOT NULL,
        comentario TEXT,
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_tema) REFERENCES temas(id_tema),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      );
    `);*/

    // TABLA REGISTROS_PROYECTO
    /*await queryRunner.query(`
      CREATE TABLE registros_proyecto (
        id_registro INT PRIMARY KEY AUTO_INCREMENT,
        id_proyecto INT NOT NULL,
        id_usuario INT NOT NULL,
        accion VARCHAR(100) NOT NULL,
        detalle TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      );
    `);*/
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE usuarios;`);
    await queryRunner.query(`DROP TABLE temas;`);
    await queryRunner.query(`DROP TABLE proyectos;`);
    await queryRunner.query(`DROP TABLE empresas;`);
  }
}