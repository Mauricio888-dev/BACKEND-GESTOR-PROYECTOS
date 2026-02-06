import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  JoinColumn, // 👈 agregado para controlar nombres de FK
} from 'typeorm';

/* =========================
   EMPRESAS
   ========================= */
@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn({ name: 'id_empresa' })
  id_empresa: number;

  @Column()
  nombre: string;

  @ManyToMany(() => Proyecto, proyecto => proyecto.empresas)
  proyectos: Proyecto[];
}

/* =========================
   PROYECTOS
   ========================= */
@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn({ name: 'id_proyecto' }) // 👈 nombre explícito
  id_proyecto: number;

  @Column()
  nombre_proyecto: string;

  @ManyToMany(() => Empresa, empresa => empresa.proyectos)
  
  @JoinTable({
    name: 'empresa_proyectos', // 👈 tabla intermedia
    joinColumn: { name: 'id_proyecto', referencedColumnName: 'id_proyecto' },
    inverseJoinColumn: { name: 'id_empresa', referencedColumnName: 'id_empresa' },
  })
  empresas: Empresa[];

  @JoinColumn({ name: 'id_empresa' }) // 👈 fuerza el nombre de la FK
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
  @PrimaryGeneratedColumn({ name: 'id_tema' }) // 👈 nombre explícito
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
  @JoinColumn({ name: 'id_proyecto' }) // 👈 fuerza el nombre de la FK
  proyecto: Proyecto;

  /*@OneToMany(() => HistorialTema, historial => historial.tema)
  historial: HistorialTema[];*/
}

/* =========================
   USUARIOS
   ========================= */
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' }) // 👈 nombre explícito
  id_usuario: number;

  @Column()
  nombre: string;

  @Column()
  password: string;

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
  @PrimaryGeneratedColumn({ name: 'id_historial' }) // 👈 nombre explícito
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
  @JoinColumn({ name: 'id_tema' }) // 👈 fuerza el nombre de la FK
  tema: Tema;

  @ManyToOne(() => Usuario, usuario => usuario.historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' }) // 👈 fuerza el nombre de la FK
  usuario: Usuario;
}*/

/* =========================
   REGISTROS_PROYECTO
   =========================
@Entity('registros_proyecto')
export class RegistroProyecto {
  @PrimaryGeneratedColumn({ name: 'id_registro' }) // 👈 nombre explícito
  id_registro: number;

  @Column()
  accion: string;

  @Column({ type: 'text', nullable: true })
  detalle: string;

  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => Proyecto, proyecto => proyecto.registros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proyecto' }) // 👈 fuerza el nombre de la FK
  proyecto: Proyecto;

  @ManyToOne(() => Usuario, usuario => usuario.registros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' }) // 👈 fuerza el nombre de la FK
  usuario: Usuario;
} */