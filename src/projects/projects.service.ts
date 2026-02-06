import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Empresa, Tema, Proyecto, Usuario } from './entities/project.entity';
import 'dotenv/config';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,
    
    @InjectRepository(Usuario)
    private readonly userrepo: Repository<Usuario>,


     private readonly dataSource: DataSource,
  ) {
    
  }


  async getEmpresas(): Promise<Empresa[]> {
  try {
    console.log('[SERVICE] getEmpresas activado');
    const empresas = await this.empresaRepo.find({ relations: ['proyectos'] });
    console.log('[SERVICE] getEmpresas resultado:', empresas);
    return empresas;
  } catch (error) {
    console.error('[SERVICE] getEmpresas error:', error);
    throw new InternalServerErrorException('Error al obtener empresas');
  }
}

async getProyectosByEmpresa(id: number): Promise<Proyecto[]> {
  try {
    console.log('[SERVICE] getProyectosByEmpresa activado con idEmpresa:', id);
    const proyectos = await this.proyectoRepo.find({
      where: { empresas: { id_empresa: id } },
      relations: ['empresas'],
    });
    console.log('[SERVICE] getProyectosByEmpresa resultado:', proyectos);
    return proyectos;
  } catch (error) {
    console.error('[SERVICE] getProyectosByEmpresa error:', error);
    throw new InternalServerErrorException('Error al obtener proyectos por empresa');
  }
}

  async getProyectoById(id: number): Promise<Proyecto> {
    try {
      const proyecto = await this.proyectoRepo.findOne({
        where: { id_proyecto: id },
        relations: ['temas', 'empresas'], // opcional
      });

      if (!proyecto) {
        throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
      }

      return proyecto;
    } catch (error) {
      console.error('Error al consultar proyecto:', error);
      throw new InternalServerErrorException('Error interno al consultar proyecto');
    }
  }



async getTemasByProyecto(id: number): Promise<Tema[]> {
  try {
    console.log('[SERVICE] getTemasByProyecto activado con idProyecto:', id);
    const temas = await this.temaRepo.find({
      where: { proyecto: { id_proyecto: id } },
      relations: ['proyecto'],
    });
    console.log('[SERVICE] getTemasByProyecto resultado:', temas);
    return temas;
  } catch (error) {
    console.error('[SERVICE] getTemasByProyecto error:', error);
    throw new InternalServerErrorException('Error al obtener temas por proyecto');
  }
}

async createEmpresa(dto: { nombreEmpresa: string }): Promise<{ success: boolean }> {
  try {
    console.log('[SERVICE] createEmpresa activado con dto:', dto);
    const empresa = this.empresaRepo.create({ nombre: dto.nombreEmpresa });
    await this.empresaRepo.save(empresa);
    console.log('[SERVICE] createEmpresa creada:', empresa);
    return { success: true };
  } catch (error) {
    console.error('[SERVICE] createEmpresa error:', error);
    throw new InternalServerErrorException('Error al registrar empresa');
  }
}

async createProyecto(dto: { nombre_proyecto: string }): Promise<{ success: boolean, id_proyecto: number}> {
  try {
    console.log('[SERVICE] createProyecto activado con dto:', dto);
    const proyecto = this.proyectoRepo.create({ nombre_proyecto: dto.nombre_proyecto });
    await this.proyectoRepo.save(proyecto);
    console.log('[SERVICE] createProyecto creado:', proyecto);
    return { success: true, id_proyecto: proyecto.id_proyecto};
  } catch (error) {
    console.error('[SERVICE] createProyecto error:', error);
    throw new InternalServerErrorException('Error al crear proyecto');
  }
}

async createTema(dto: { nombre_tema: string; id_proyecto: number }): Promise<{ success: boolean }> {
  try {
    console.log('[SERVICE] createTema activado con dto:', dto);
    const proyecto = await this.proyectoRepo.findOneBy({ id_proyecto: dto.id_proyecto });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    const tema = this.temaRepo.create({ nombre_tema: dto.nombre_tema, proyecto });
    await this.temaRepo.save(tema);
    console.log('[SERVICE] createTema creado:', tema);
    return { success: true };
  } catch (error) {
    console.error('[SERVICE] createTema error:', error);
    throw new InternalServerErrorException('Error al crear tema');
  }
}

async addProyectoToEmpresa(id_empresa: number, id_proyecto: number): Promise<{ success: boolean }> {
  try {
    console.log('[SERVICE] addProyectoToEmpresa activado con idEmpresa:', id_empresa, 'idProyecto:', id_proyecto);
    const empresa = await this.empresaRepo.findOne({
      where: { id_empresa },
      relations: ['proyectos'],
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    const proyecto = await this.proyectoRepo.findOneBy({ id_proyecto });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    empresa.proyectos.push(proyecto);
    await this.empresaRepo.save(empresa);
    console.log('[SERVICE] addProyectoToEmpresa actualizado:', empresa);
    return { success: true };
  } catch (error) {
    console.error('[SERVICE] addProyectoToEmpresa error:', error);
    throw new InternalServerErrorException('Error al agregar proyecto a empresa');
  }
}

  async updateTemaEstado(id_tema: number, dto: { estado: string }): Promise<{ success: boolean }> {
    console.log('[SERVICE] updateTemaEstado activado con idTema:', id_tema, 'dto:', dto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tema = await queryRunner.manager.findOne(Tema, { where: { id_tema } });
      if (!tema) throw new NotFoundException('Tema no encontrado');

      tema.estado = dto.estado;
      await queryRunner.manager.save(tema);

      await queryRunner.commitTransaction(); // 👈 confirmamos la transacción
      console.log('[SERVICE] updateTemaEstado actualizado:', tema);

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 👈 revertimos cambios si falla
      console.error('[SERVICE] updateTemaEstado error, rollback ejecutado:', error);
      throw new InternalServerErrorException('Error al actualizar estado del tema');
    } finally {
      await queryRunner.release(); // 👈 liberamos el queryRunner
    }
  }

}