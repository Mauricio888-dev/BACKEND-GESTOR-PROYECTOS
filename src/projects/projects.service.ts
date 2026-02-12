import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Empresa, Tema, Proyecto, Usuario, EmpresaProyectoTema, EmpresaProyecto } from './entities/project.entity';
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
    @InjectRepository(EmpresaProyectoTema)
    private readonly EmpresaProyectoTemaRepo: Repository<EmpresaProyectoTema>,
    @InjectRepository(EmpresaProyecto)
    private readonly EmpresaProyectorepo: Repository<EmpresaProyecto>,
    @InjectRepository(Usuario)
    private readonly userrepo: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

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

  async getAllProyectos(): Promise<Proyecto[]> {
    try {
      console.log('[SERVICE] getAllProyectos activado');
      const proyectos = await this.proyectoRepo.find({ relations: ['empresas', 'temas'] });
      console.log('[SERVICE] getAllProyectos resultado:', proyectos);
      return proyectos;
    } catch (error) {
      console.error('[SERVICE] getAllProyectos error:', error);
      throw new InternalServerErrorException('Error al obtener todos los proyectos');
    }
  }

  async getProyectoById(id: number): Promise<Proyecto> {
    try {
      const proyecto = await this.proyectoRepo.findOne({
        where: { id_proyecto: id },
        relations: ['temas', 'empresas'], // opcional
      });
      if (!proyecto) throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
      return proyecto;
    } catch (error) {
      console.error('Error al consultar proyecto:', error);
      throw new InternalServerErrorException('Error interno al consultar proyecto');
    }
  }

  async getTemasByProyecto(id_proyecto: number): Promise<Tema[]> {
    try {
      console.log('[SERVICE] getTemasByProyecto activado con idProyecto:', id_proyecto);

      const proyecto = await this.proyectoRepo.findOne({
        where: { id_proyecto },
        relations: ['temas'],
      });

      if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

      console.log('[SERVICE] getTemasByProyecto resultado:', proyecto.temas);
      return proyecto.temas;
    } catch (error) {
      console.error('[SERVICE] getTemasByProyecto error:', error);
      throw new InternalServerErrorException('Error al obtener temas del proyecto');
    }
  }

  async getTemasByEmpresaProyecto(
    id_empresa: number,
    id_proyecto: number
  ): Promise<{ id_tema: number; nombre_tema: string; descripcion: string; estado: string }[]> {
    try {
      console.log('[SERVICE] getTemasByEmpresaProyecto activado con empresa:', id_empresa, 'proyecto:', id_proyecto);
      const registros = await this.EmpresaProyectoTemaRepo.find({
        where: { empresa: { id_empresa }, proyecto: { id_proyecto } },
        relations: ['tema'],
      });
      const resultado = registros.map(r => ({
        id_tema: r.tema.id_tema,
        nombre_tema: r.tema.nombre_tema,
        descripcion: r.tema.descripcion,
        estado: r.estado,
      }));
      console.log('[SERVICE] getTemasByEmpresaProyecto resultado:', resultado);
      return resultado;
    } catch (error) {
      console.error('[SERVICE] getTemasByEmpresaProyecto error:', error);
      throw new InternalServerErrorException('Error al obtener temas con estado por empresa');
    }
  }

  async createEmpresa(dto: { nombre: string }): Promise<{ success: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('[SERVICE] createEmpresa activado con dto:', dto);
      const empresa = queryRunner.manager.create(Empresa, { nombre: dto.nombre });
      await queryRunner.manager.save(empresa);
      await queryRunner.commitTransaction(); // 👈 confirmamos la transacción
      console.log('[SERVICE] createEmpresa creada:', empresa);
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 👈 revertimos cambios si falla
      console.error('[SERVICE] createEmpresa error, rollback ejecutado:', error);
      throw new InternalServerErrorException('Error al registrar empresa');
    } finally {
      await queryRunner.release(); // 👈 liberamos el queryRunner
    }
  }

  async createProyecto(dto: { nombre_proyecto: string }): Promise<{ success: boolean; id_proyecto: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('[SERVICE] createProyecto activado con dto:', dto);
      const proyecto = queryRunner.manager.create(Proyecto, { nombre_proyecto: dto.nombre_proyecto });
      await queryRunner.manager.save(proyecto);
      await queryRunner.commitTransaction(); // 👈 confirmamos la transacción
      console.log('[SERVICE] createProyecto creado:', proyecto);
      return { success: true, id_proyecto: proyecto.id_proyecto };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 👈 revertimos cambios si falla
      console.error('[SERVICE] createProyecto error, rollback ejecutado:', error);
      throw new InternalServerErrorException('Error al crear proyecto');
    } finally {
      await queryRunner.release(); // 👈 liberamos el queryRunner
    }
  }

  async createTema(dto: { nombre_tema: string; id_proyecto: number }): Promise<{ success: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('[SERVICE] createTema activado con dto:', dto);
      const proyecto = await queryRunner.manager.findOne(Proyecto, { where: { id_proyecto: dto.id_proyecto } });
      if (!proyecto) throw new NotFoundException('Proyecto no encontrado');
      const tema = queryRunner.manager.create(Tema, { nombre_tema: dto.nombre_tema, proyecto });
      await queryRunner.manager.save(tema);
      await queryRunner.commitTransaction(); // 👈 confirmamos la transacción
      console.log('[SERVICE] createTema creado:', tema);
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 👈 revertimos cambios si falla
      console.error('[SERVICE] createTema error, rollback ejecutado:', error);
      throw new InternalServerErrorException('Error al crear tema');
    } finally {
      await queryRunner.release(); // 👈 liberamos el queryRunner
    }
  }

  async addProyectoToEmpresa(id_empresa: number, id_proyecto: number): Promise<{ success: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('[SERVICE] addProyectoToEmpresa activado con idEmpresa:', id_empresa, 'idProyecto:', id_proyecto);
      const empresa = await queryRunner.manager.findOne(Empresa, { where: { id_empresa } });
      if (!empresa) throw new NotFoundException('Empresa no encontrada');
      const proyecto = await queryRunner.manager.findOne(Proyecto, { where: { id_proyecto }, relations: ['temas'] });
      if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

      // Crear relación empresa-proyecto
      const relacion = queryRunner.manager.create(EmpresaProyecto, { empresa, proyecto, id_empresa, id_proyecto });
      await queryRunner.manager.save(relacion);

      // Inicializar estados en empresa_proyecto_tema
      for (const tema of proyecto.temas) {
        const registro = queryRunner.manager.create(EmpresaProyectoTema, {
          empresa,
          proyecto,
          tema,
          estado: 'sin registro',
        });
        await queryRunner.manager.save(registro);
      }

      await queryRunner.commitTransaction(); // 👈 confirmamos la transacción
      console.log('[SERVICE] addProyectoToEmpresa actualizado con inicialización de temas');
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 👈 revertimos cambios si falla
      console.error('[SERVICE] addProyectoToEmpresa error, rollback ejecutado:', error);
      throw new InternalServerErrorException('Error al agregar proyecto a empresa');
    } finally {
      await queryRunner.release(); // 👈 liberamos el queryRunner
    }
  }

  async createTemaEnEmpresaProyecto(
    id_empresa: number,
    id_proyecto: number,
    dto: { nombre_tema: string }
  ): Promise<{ success: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('[SERVICE] createTemaEnEmpresaProyecto activado con empresa:', id_empresa, 'proyecto:', id_proyecto, 'dto:', dto);

      // Verificar que la empresa existe
      const empresa = await queryRunner.manager.findOne(Empresa, { where: { id_empresa } });
      if (!empresa) throw new NotFoundException('Empresa no encontrada');

      // Verificar que el proyecto existe
      const proyecto = await queryRunner.manager.findOne(Proyecto, { where: { id_proyecto } });
      if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

      // Crear el nuevo tema asociado al proyecto
      const tema = queryRunner.manager.create(Tema, { nombre_tema: dto.nombre_tema, proyecto });
      await queryRunner.manager.save(tema);

      // Crear la relación empresa-proyecto-tema con estado inicial
      const relacion = queryRunner.manager.create(EmpresaProyectoTema, {
        empresa,
        proyecto,
        tema,
        estado: 'sin registro',
      });
      await queryRunner.manager.save(relacion);

      await queryRunner.commitTransaction(); // 👈 confirmamos la transacción
      console.log('[SERVICE] createTemaEnEmpresaProyecto creado y asociado:', tema, relacion);

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 👈 revertimos cambios si falla
      console.error('[SERVICE] createTemaEnEmpresaProyecto error, rollback ejecutado:', error);
      throw new InternalServerErrorException('Error al crear tema en empresa-proyecto');
    } finally {
      await queryRunner.release(); // 👈 liberamos el queryRunner
    }
  }

   async updateTemaEstado(
    id_empresa: number,
    id_proyecto: number,
    id_tema: number,
    dto: { estado: 'realizado' | 'sin registro' | 'en proceso' }
  ): Promise<{ success: boolean }> {
    console.log('[SERVICE] updateTemaEstado activado con empresa:', id_empresa, 'proyecto:', id_proyecto, 'tema:', id_tema, 'dto:', dto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const relacion = await queryRunner.manager.findOne(EmpresaProyectoTema, {
        where: {
          empresa: { id_empresa },
          proyecto: { id_proyecto },
          tema: { id_tema },
        },
        relations: ['empresa', 'proyecto', 'tema'],
      });

      if (!relacion) throw new NotFoundException('Relación empresa-proyecto-tema no encontrada');

      relacion.estado = dto.estado;
      await queryRunner.manager.save(relacion);

      await queryRunner.commitTransaction(); // 👈 confirmamos la transacción
      console.log('[SERVICE] updateTemaEstado actualizado:', relacion);

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