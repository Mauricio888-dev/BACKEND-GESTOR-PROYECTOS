import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

/* =========================
   EMPRESAS
   ========================= */
@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id_empresa: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => Proyecto, proyecto => proyecto.empresa)
  proyectos: Proyecto[];
}

/* =========================
   PROYECTOS
   ========================= */
@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id_proyecto: number;

  @Column()
  nombre_proyecto: string;

  @ManyToOne(() => Empresa, empresa => empresa.proyectos, { onDelete: 'CASCADE' })
  empresa: Empresa;

  @OneToMany(() => Tema, tema => tema.proyecto)
  temas: Tema[];

  /*@OneToMany(() => RegistroProyecto, registro => registro.proyecto)
  registros: RegistroProyecto[];*/
}

/* =========================
   TEMAS
   ========================= */
@Entity('temas')
export class Tema {
  @PrimaryGeneratedColumn()
  id_tema: number;

  @Column()
  nombre_tema: string;

  @Column({
    type: 'enum',
    enum: ['realizado', 'sin registro', 'en proceso'],
    default: 'sin registro',
  })
  estado: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Proyecto, proyecto => proyecto.temas, { onDelete: 'CASCADE' })
  proyecto: Proyecto;

  /*@OneToMany(() => HistorialTema, historial => historial.tema)
  historial: HistorialTema[];*/
}

/* =========================
   USUARIOS
   ========================= */
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'implementador', 'cliente'],
  })
  rol: string;

  /*@OneToMany(() => HistorialTema, historial => historial.usuario)
  historial: HistorialTema[];

  @OneToMany(() => RegistroProyecto, registro => registro.usuario)
  registros: RegistroProyecto[];*/
}

/* =========================
   HISTORIAL_TEMA
   ========================= 
@Entity('historial_tema')
export class HistorialTema {
  @PrimaryGeneratedColumn()
  id_historial: number;

  @Column({
    type: 'enum',
    enum: ['realizado', 'sin registro', 'en proceso'],
  })
  estado: string;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn({ name: 'fecha_cambio' })
  fecha_cambio: Date;

  @ManyToOne(() => Tema, tema => tema.historial, { onDelete: 'CASCADE' })
  tema: Tema;

  @ManyToOne(() => Usuario, usuario => usuario.historial, { onDelete: 'CASCADE' })
  usuario: Usuario;
}*/

/* =========================
   REGISTROS_PROYECTO
   =========================
@Entity('registros_proyecto')
export class RegistroProyecto {
  @PrimaryGeneratedColumn()
  id_registro: number;

  @Column()
  accion: string;

  @Column({ type: 'text', nullable: true })
  detalle: string;

  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => Proyecto, proyecto => proyecto.registros, { onDelete: 'CASCADE' })
  proyecto: Proyecto;

  @ManyToOne(() => Usuario, usuario => usuario.registros, { onDelete: 'CASCADE' })
  usuario: Usuario;
} */