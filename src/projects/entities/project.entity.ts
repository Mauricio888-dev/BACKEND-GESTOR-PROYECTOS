import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  Unique
} from 'typeorm';

/* =========================
   EMPRESAS
   ========================= */
@Entity('empresas')
export class Empresa {

  @PrimaryGeneratedColumn({ name: 'id_empresa', type: 'int' })
  id_empresa: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => EmpresaProyecto, ep => ep.empresa)
  empresaProyectos: EmpresaProyecto[];
}


/* =========================
   PROYECTOS
   ========================= */
@Entity('proyectos')
export class Proyecto {

  @PrimaryGeneratedColumn({ name: 'id_proyecto', type: 'int' })
  id_proyecto: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => EmpresaProyecto, ep => ep.proyecto)
  empresaProyectos: EmpresaProyecto[];

  @OneToMany(() => Etapa, etapa => etapa.proyecto)
  etapas: Etapa[];
}


/* =========================
   EMPRESA_PROYECTOS
   ========================= */
@Entity('empresa_proyectos')
@Unique(['empresa', 'proyecto'])
export class EmpresaProyecto {

  @PrimaryGeneratedColumn({ name: 'id_em_p', type: 'int' })
  id_em_p: number;

  @ManyToOne(() => Empresa, empresa => empresa.empresaProyectos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @ManyToOne(() => Proyecto, proyecto => proyecto.empresaProyectos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @OneToMany(() => Calificacion, calificacion => calificacion.empresaProyecto)
  calificaciones: Calificacion[];
}


/* =========================
   ETAPAS
   ========================= */
@Entity('etapas')
export class Etapa {

  @PrimaryGeneratedColumn({ name: 'id_etapa', type: 'int' })
  id_etapa: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ManyToOne(() => Proyecto, proyecto => proyecto.etapas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @OneToMany(() => Tema, tema => tema.etapa)
  temas: Tema[];
}


/* =========================
   TEMAS
   ========================= */
@Entity('temas')
export class Tema {

  @PrimaryGeneratedColumn({ name: 'id_tema', type: 'int' })
  id_tema: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /*@ManyToOne(() => Proyecto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;*/

  @ManyToOne(() => Etapa, etapa => etapa.temas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_etapa' })
  etapa: Etapa;

  @OneToMany(() => SubTema, subtema => subtema.tema)
  subtemas: SubTema[];

  @OneToMany(() => Calificacion, calificacion => calificacion.tema)
  calificaciones: Calificacion[];
}

/* =========================
   SUB_TEMAS
   ========================= */
@Entity('sub_temas')
export class SubTema {

  @PrimaryGeneratedColumn({ name: 'id_subtema', type: 'int' })
  id_subtema: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ManyToOne(() => Tema, tema => tema.subtemas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_tema' })
  tema: Tema;

  @OneToMany(() => Calificacion, calificacion => calificacion.subtema)
  calificaciones: Calificacion[];
}


/* =========================
   CALIFICACIONES
   ========================= */
@Entity('calificaciones')
export class Calificacion {

  @PrimaryGeneratedColumn({ name: 'id_calificacion', type: 'int' })
  id_calificacion: number;

  @Column({
    type: 'enum',
    enum: ['done', 'pending', 'none'],
    default: 'none'
  })
  estado: 'done' | 'pending' | 'none';

  @CreateDateColumn({
    name: 'fecha',
    type: 'timestamp',
  })
  fecha: Date;

  @ManyToOne(() => EmpresaProyecto, ep => ep.calificaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_em_p' })
  empresaProyecto: EmpresaProyecto;

  @ManyToOne(() => Etapa, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_etapa' })
  etapa: Etapa;

  @ManyToOne(() => Tema, tema => tema.calificaciones, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_tema' })
  tema: Tema;

  @ManyToOne(() => SubTema, subtema => subtema.calificaciones, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_subtema' })
  subtema: SubTema;
}


/* =========================
   USUARIOS
   ========================= */
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'implementador', 'cliente'],
  })
  rol: 'admin' | 'implementador' | 'cliente';
}