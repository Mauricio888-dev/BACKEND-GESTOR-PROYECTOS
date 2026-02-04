import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa, Tema, Proyecto, Usuario } from './entities/project.entity';
import 'dotenv/config';
import {runSeed} from '../database/seeds/seed'


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

  ) {
    
  }


  async getEmpresas(): Promise<Empresa[]> {
    try {
      return await this.empresaRepo.find({ relations: ['proyectos'] });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener empresas');
    }
  }

  async getProyectosByEmpresa(id: number): Promise<Proyecto[]> {
    try {
      return await this.proyectoRepo.find({
        where: { empresas: { id_empresa: id } },
        relations: ['empresas'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener proyectos por empresa');
    }
  }

  async getTemasByProyecto(id: number): Promise<Tema[]> {
    try {
      return await this.temaRepo.find({
        where: { proyecto: { id_proyecto: id } },
        relations: ['proyecto'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener temas por proyecto');
    }
  }

  async createEmpresa(dto: { nombreEmpresa: string }): Promise<{ success: boolean }> {
    try {
      const empresa = this.empresaRepo.create({ nombre: dto.nombreEmpresa });
      await this.empresaRepo.save(empresa);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error al registrar empresa');
    }
  }

  async createProyecto(dto: { nombre_proyecto: string }): Promise<{ success: boolean }> {
    try {
      const proyecto = this.proyectoRepo.create({ nombre_proyecto: dto.nombre_proyecto });
      await this.proyectoRepo.save(proyecto);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error al crear proyecto');
    }
  }

  async createTema(dto: { nombre_tema: string; id_proyecto: number }): Promise<{ success: boolean }> {
    try {
      const proyecto = await this.proyectoRepo.findOneBy({ id_proyecto: dto.id_proyecto });
      if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

      const tema = this.temaRepo.create({ nombre_tema: dto.nombre_tema, proyecto });
      await this.temaRepo.save(tema);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error al crear tema');
    }
  }

  async addProyectoToEmpresa(id_empresa: number, id_proyecto: number): Promise<{ success: boolean }> {
    try {
      const empresa = await this.empresaRepo.findOne({
        where: { id_empresa },
        relations: ['proyectos'],
      });
      if (!empresa) throw new NotFoundException('Empresa no encontrada');

      const proyecto = await this.proyectoRepo.findOneBy({ id_proyecto });
      if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

      empresa.proyectos.push(proyecto);
      await this.empresaRepo.save(empresa);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error al agregar proyecto a empresa');
    }
  }

  async updateTemaEstado(id_tema: number, dto: { estado: string }): Promise<{ success: boolean }> {
    try {
      const tema = await this.temaRepo.findOneBy({ id_tema });
      if (!tema) throw new NotFoundException('Tema no encontrado');

      tema.estado = dto.estado;
      await this.temaRepo.save(tema);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar estado del tema');
    }
  }
}