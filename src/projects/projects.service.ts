import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
  DataSource,
  QueryRunner,
  In,
} from 'typeorm'

import {
  Empresa,
  Proyecto,
  Tema,
  Etapa,
  SubTema,
  Usuario,
  EmpresaProyecto,
  Calificacion,
} from './entities/project.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,

    @InjectRepository(Etapa)
    private readonly etapaRepo: Repository<Etapa>,

    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,

    @InjectRepository(SubTema)
    private readonly SubTemaRepo: Repository<SubTema>,

    @InjectRepository(EmpresaProyecto)
    private readonly empresaProyectoRepo: Repository<EmpresaProyecto>,

    @InjectRepository(Calificacion)
    private readonly calificacionRepo: Repository<Calificacion>,

    @InjectRepository(Usuario)
    private readonly userRepo: Repository<Usuario>,

    private readonly dataSource: DataSource,


  ) {}

  /* =====================================================
   EMPRESAS
===================================================== */

async getEmpresas(): Promise<any[]> {
  const empresas = await this.empresaRepo.find({
    relations: ['empresaProyectos', 'empresaProyectos.proyecto'],
  });

  return empresas.map(e => ({
    id_empresa: e.id_empresa,
    nombre: e.nombre,
    proyectos: e.empresaProyectos.map(ep => ep.proyecto),
  }));
}

async createEmpresa(dto: { nombre: string }) {
  const empresa = this.empresaRepo.create(dto);
  await this.empresaRepo.save(empresa);
  return { success: true };
}

/* =====================================================
   PROYECTOS
===================================================== */

async getAllProyectos(): Promise<any[]> {
  const proyectos = await this.proyectoRepo.find({
    relations: ['empresaProyectos', 'empresaProyectos.empresa', 'etapas'],
  });

  return proyectos.map(p => ({
    id_proyecto: p.id_proyecto,
    nombre: p.nombre,
    empresas: p.empresaProyectos.map(ep => ep.empresa),
    etapas: p.etapas,
  }));
}

async getProyectoById(id: number): Promise<any> {
  const proyecto = await this.proyectoRepo.findOne({
    where: { id_proyecto: id },
    relations: [
      'empresaProyectos',
      'empresaProyectos.empresa',
      'etapas',
      'etapas.temas',
      'etapas.temas.subtemas',
    ],
  });

  if (!proyecto)
    throw new NotFoundException(`Proyecto ${id} no encontrado`);

  return proyecto;
}

async createProyecto(dto: { nombre: string }) {
  const proyecto = this.proyectoRepo.create(dto);
  await this.proyectoRepo.save(proyecto);
  return { success: true, id_proyecto: proyecto.id_proyecto };
}

async getProyectosByEmpresa(id_empresa: number) {
  const empresaProyectos = await this.empresaProyectoRepo.find({
    where: { empresa: { id_empresa } },
    relations: ['proyecto'],
  });

  return empresaProyectos.map(ep => ep.proyecto);
}

/* =====================================================
   RELACION EMPRESA - PROYECTO
===================================================== */

async addProyectoToEmpresa(id_empresa: number, id_proyecto: number) {
  const empresa = await this.empresaRepo.findOne({ where: { id_empresa } });
  if (!empresa) throw new NotFoundException('Empresa no encontrada');

  const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto } });
  if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

  const existe = await this.empresaProyectoRepo.findOne({
    where: { empresa: { id_empresa }, proyecto: { id_proyecto } },
  });

  if (existe) return { success: true };

  const relacion = this.empresaProyectoRepo.create({ empresa, proyecto });
  await this.empresaProyectoRepo.save(relacion);

  return { success: true };
}

/* =====================================================
   ETAPAS
===================================================== */

async getEtapasByProyecto(
  id_proyecto: number,
  id_empresa: number,
) {
  const empresaProyecto = await this.empresaProyectoRepo.findOne({
    where: {
      empresa: { id_empresa },
      proyecto: { id_proyecto },
    },
  });

  if (!empresaProyecto)
    throw new NotFoundException('Empresa-Proyecto no encontrado');

  const etapas = await this.etapaRepo
    .createQueryBuilder('etapa')
    .leftJoin(
      Calificacion,
      'cal',
      'cal.id_etapa = etapa.id_etapa AND cal.id_em_p = :id_em_p',
      { id_em_p: empresaProyecto.id_em_p },
    )
    .where('etapa.id_proyecto = :id_proyecto', { id_proyecto })
    .select([
      'etapa.id_etapa',
      'etapa.nombre',
      'COALESCE(cal.estado, "none") as estado',
    ])
    .orderBy('etapa.id_etapa', 'ASC')
    .getRawMany();

  return etapas;
}


async createEtapa(dto: { nombre: string; id_proyecto: number }) {
  const proyecto = await this.proyectoRepo.findOne({
    where: { id_proyecto: dto.id_proyecto },
  });

  if (!proyecto)
    throw new NotFoundException('Proyecto no encontrado');

  const etapa = this.etapaRepo.create({
    nombre: dto.nombre,
    proyecto,
  });

  await this.etapaRepo.save(etapa);
  return { success: true };
}

/* =====================================================
   TEMAS
===================================================== */

async getTemasByEtapa(
  id_etapa: number,
  id_empresa: number,
  id_proyecto: number,
) {
  const empresaProyecto = await this.empresaProyectoRepo.findOne({
    where: {
      empresa: { id_empresa },
      proyecto: { id_proyecto },
    },
  });

  if (!empresaProyecto)
    throw new NotFoundException('Empresa-Proyecto no encontrado');

  return this.temaRepo
    .createQueryBuilder('tema')
    .leftJoinAndMapOne(
      'tema.calificacion',
      Calificacion,
      'cal',
      'cal.id_tema = tema.id_tema AND cal.id_em_p = :id_em_p',
      { id_em_p: empresaProyecto.id_em_p },
    )
    .where('tema.id_etapa = :id_etapa', { id_etapa })
    .getMany();
}


async createTema(dto: {
  nombre: string;
  id_proyecto: number;
  id_etapa: number;
}) {
  const etapa = await this.etapaRepo.findOne({
    where: { id_etapa: dto.id_etapa },
  });

  if (!etapa)
    throw new NotFoundException('Etapa no encontrada');

  const tema = this.temaRepo.create({
    nombre: dto.nombre,
    etapa,
  });

  await this.temaRepo.save(tema);
  return { success: true };
}

/* =====================================================
   SUBTEMAS
===================================================== */

async getSubtemasByTema(
  id_tema: number,
  id_empresa: number,
  id_proyecto: number,
) {
  const empresaProyecto = await this.empresaProyectoRepo.findOne({
    where: {
      empresa: { id_empresa },
      proyecto: { id_proyecto },
    },
  });

  if (!empresaProyecto)
    throw new NotFoundException('Empresa-Proyecto no encontrado');

  const subtemas = await this.SubTemaRepo
    .createQueryBuilder('subtema')
    .leftJoin(
      Calificacion,
      'cal',
      'cal.id_subtema = subtema.id_subtema AND cal.id_em_p = :id_em_p',
      { id_em_p: empresaProyecto.id_em_p },
    )
    .where('subtema.id_tema = :id_tema', { id_tema })
    .select([
      'subtema.id_subtema',
      'subtema.nombre',
      'COALESCE(cal.estado, "none") as estado',
    ])
    .orderBy('subtema.id_subtema', 'ASC')
    .getRawMany();

  return subtemas;
}


async createSubtema(dto: { nombre: string; id_tema: number }) {
  const tema = await this.temaRepo.findOne({
    where: { id_tema: dto.id_tema },
  });

  if (!tema)
    throw new NotFoundException('Tema no encontrado');

  const subtema = this.SubTemaRepo.create({
    nombre: dto.nombre,
    tema,
  });

  await this.SubTemaRepo.save(subtema);
  return { success: true };
}

/* =====================================================
   CALIFICACIONES - UPDATE CON TRANSACCION + CASCADA
===================================================== */
async updateEstadoGeneral(dto: {
  id_empresa: number;
  id_proyecto: number;
  id_etapa?: number;
  id_tema?: number;
  id_subtema?: number;
  estado: 'done' | 'pending' | 'none';
}) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  console.log('===== INICIO updateEstadoGeneral =====');
  console.log('DTO:', dto);

  try {
    const empresaProyecto = await queryRunner.manager.findOne(
      EmpresaProyecto,
      {
        where: {
          empresa: { id_empresa: dto.id_empresa },
          proyecto: { id_proyecto: dto.id_proyecto },
        },
      },
    );

    if (!empresaProyecto)
      throw new NotFoundException('Empresa-Proyecto no encontrado');

    const id_em_p = empresaProyecto.id_em_p;

    await this.upsertEstadoTx(queryRunner, id_em_p, dto);

    await this.recalcularEstadosTx(
      queryRunner,
      id_em_p,
      dto.id_subtema,
      dto.id_tema,
      dto.id_etapa,
    );

    await queryRunner.commitTransaction();
    console.log('COMMIT OK');

    return { success: true };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log('ROLLBACK EJECUTADO');
    throw error;
  } finally {
    await queryRunner.release();
  }
}



/* =====================================================
   HELPERS PRIVADOS
===================================================== */

private async upsertEstadoTx(
  queryRunner,
  id_em_p: number,
  params: {
    id_etapa?: number;
    id_tema?: number;
    id_subtema?: number;
    estado: 'done' | 'pending' | 'none';
  },
) {
  const repo = queryRunner.manager.getRepository(Calificacion);

  let cal = await repo.findOne({
    where: {
      empresaProyecto: { id_em_p },
      etapa: params.id_etapa ? { id_etapa: params.id_etapa } : null,
      tema: params.id_tema ? { id_tema: params.id_tema } : null,
      subtema: params.id_subtema
        ? { id_subtema: params.id_subtema }
        : null,
    },
  });

  if (!cal) {
    cal = repo.create({
      estado: params.estado,
      empresaProyecto: { id_em_p },
      etapa: params.id_etapa ? { id_etapa: params.id_etapa } : null,
      tema: params.id_tema ? { id_tema: params.id_tema } : null,
      subtema: params.id_subtema
        ? { id_subtema: params.id_subtema }
        : null,
    });
  } else {
    cal.estado = params.estado;
  }

  await repo.save(cal);
}


private async recalcularEstadosTx(
  queryRunner,
  id_em_p: number,
  id_subtema?: number,
  id_tema?: number,
  id_etapa?: number,
) {
  const calRepo = queryRunner.manager.getRepository(Calificacion);
  const subRepo = queryRunner.manager.getRepository(SubTema);
  const temaRepo = queryRunner.manager.getRepository(Tema);

  /* =====================
     SUBTEMA → TEMA
  ===================== */
  if (id_subtema) {
    const subtema = await subRepo.findOne({
      where: { id_subtema },
      relations: ['tema'],
    });

    if (!subtema) return;

    id_tema = subtema.tema.id_tema;
  }

  /* =====================
     TEMA → ETAPA
  ===================== */
  if (id_tema) {
    const subtemas = await subRepo.find({
      where: { tema: { id_tema } },
    });

    if (subtemas.length > 0) {
      const estados = await calRepo.find({
        where: {
          empresaProyecto: { id_em_p },
          subtema: { id_subtema: In(subtemas.map(s => s.id_subtema)) },
        },
        relations: ['subtema'],
      });

      const blockingSubtema = subtemas.find(st => {
        const estado = estados.find(
          e => e.subtema?.id_subtema === st.id_subtema,
        );
        return estado?.estado !== 'done';
      });

      const allDone = !blockingSubtema;

      if (allDone) {
        console.log(`✅ Tema ${id_tema} pasó a DONE`);
      } else {
        console.log(
          `❌ Tema ${id_tema} NO pudo pasar a DONE. Subtema ${blockingSubtema.id_subtema} está en estado distinto de done`,
        );
      }

      await this.upsertEstadoTx(queryRunner, id_em_p, {
        id_tema,
        estado: allDone ? 'done' : 'pending',
      });
    }

    const tema = await temaRepo.findOne({
      where: { id_tema },
      relations: ['etapa'],
    });

    if (tema) {
      id_etapa = tema.etapa.id_etapa;
    }
  }

  /* =====================
     ETAPA FINAL
  ===================== */
  if (id_etapa) {
    const temas = await temaRepo.find({
      where: { etapa: { id_etapa } },
    });

    if (temas.length > 0) {
      const estados = await calRepo.find({
        where: {
          empresaProyecto: { id_em_p },
          tema: { id_tema: In(temas.map(t => t.id_tema)) },
        },
        relations: ['tema'],
      });

      const blockingTema = temas.find(t => {
        const estadoTema = estados.find(
          e => e.tema?.id_tema === t.id_tema,
        );
        return estadoTema?.estado !== 'done';
      });

      const allDone = !blockingTema;

      if (allDone) {
        console.log(`✅ Etapa ${id_etapa} pasó a DONE`);
      } else {
        console.log(
          `❌ Etapa ${id_etapa} NO pudo pasar a DONE. Tema ${blockingTema.id_tema} está en estado distinto de done`,
        );
      }

      await this.upsertEstadoTx(queryRunner, id_em_p, {
        id_etapa,
        estado: allDone ? 'done' : 'pending',
      });
    }
  }
}




/* =====================================================
   ARBOL COMPLETO OPTIMIZADO
===================================================== */

async getArbolCompletoConEstados(id_empresa: number, id_proyecto: number) {
  const empresaProyecto = await this.empresaProyectoRepo.findOne({
    where: {
      empresa: { id_empresa },
      proyecto: { id_proyecto },
    },
  });

  if (!empresaProyecto)
    throw new NotFoundException('Empresa-Proyecto no encontrado');

  return this.proyectoRepo
    .createQueryBuilder('proyecto')
    .leftJoinAndSelect('proyecto.etapas', 'etapa')
    .leftJoinAndSelect('etapa.temas', 'tema')
    .leftJoinAndSelect('tema.subtemas', 'subtema')
    .leftJoinAndMapOne(
      'tema.calificacion',
      Calificacion,
      'calTema',
      'calTema.id_tema = tema.id_tema AND calTema.id_em_p = :id_em_p',
      { id_em_p: empresaProyecto.id_em_p },
    )
    .leftJoinAndMapOne(
      'subtema.calificacion',
      Calificacion,
      'calSub',
      'calSub.id_subtema = subtema.id_subtema AND calSub.id_em_p = :id_em_p',
      { id_em_p: empresaProyecto.id_em_p },
    )
    .where('proyecto.id_proyecto = :id_proyecto', { id_proyecto })
    .getOne();
}
}