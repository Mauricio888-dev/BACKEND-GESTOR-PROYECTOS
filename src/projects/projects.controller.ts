import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Empresa, Tema, Proyecto } from './entities/project.entity';


@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('empresas')
  async getEmpresas(): Promise<Empresa[]> {
    return this.projectsService.getEmpresas();
  }

  @Get('empresas/:id/proyectos')
  async getProyectosByEmpresa(@Param('id') id: number): Promise<Proyecto[]> {
    return this.projectsService.getProyectosByEmpresa(id);
  }

  @Get('proyectos/:id/temas')
  async getTemasByProyecto(@Param('id') id: number): Promise<Tema[]> {
    return this.projectsService.getTemasByProyecto(id);
  }
}