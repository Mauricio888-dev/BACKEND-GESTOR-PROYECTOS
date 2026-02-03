import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa, Tema, Proyecto, Usuario } from './entities/project.entity';


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
    
  ) {}

  async getEmpresas(): Promise<Empresa[]> {
    return this.empresaRepo.find();
  }

  async getProyectosByEmpresa(id: number): Promise<Proyecto[]> {
    return this.proyectoRepo.find({
      where: { empresa: { id_empresa: id } },
      relations: ['empresa'],
    });
  }

  async getTemasByProyecto(id: number): Promise<Tema[]> {
    return this.temaRepo.find({
      where: { proyecto: { id_proyecto: id } },
      relations: ['proyecto'],
    });
  }
}