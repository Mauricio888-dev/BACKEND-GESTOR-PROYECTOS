import { Body, Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Empresa, Tema, Proyecto } from './entities/project.entity';



@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Obtener todas las empresas
  @Get('empresas')
  async getEmpresas(): Promise<Empresa[]> {
    return this.projectsService.getEmpresas();
  }

  // Obtener proyectos por empresa
  @Get('empresas/:idEmpresa/proyectos')
  async getProyectosByEmpresa(@Param('idEmpresa') id: number): Promise<Proyecto[]> {
    return this.projectsService.getProyectosByEmpresa(id);
  }

  // Obtener temas por proyecto
  @Get('proyectos/:idProyecto/temas')
  async getTemasByProyecto(@Param('idProyecto') id: number): Promise<Tema[]> {
    return this.projectsService.getTemasByProyecto(id);
  }

  // Registrar empresa
  @Post('registrar-empresa')
  async postRegistrarEmpresa(@Body() dto: { nombreEmpresa: string }): Promise<{ success: boolean }> {
    return this.projectsService.createEmpresa(dto);
  }

  // Crear proyecto independiente
  @Post('crear-proyecto')
  async postCrearProyecto(@Body() dto: { nombre_proyecto: string }): Promise<{ success: boolean }> {
    return this.projectsService.createProyecto(dto);
  }

  // Crear tema dependiente de proyecto
  @Post('crear-tema')
  async postCrearTema(@Body() dto: { nombre_tema: string; id_proyecto: number }): Promise<{ success: boolean }> {
    return this.projectsService.createTema(dto);
  }

  // Agregar proyecto a empresa (ManyToMany)
  @Post('empresas/:idEmpresa/agregar-proyecto/:idProyecto')
  async postAgregarProyectoToEmpresa(
    @Param('idEmpresa') id_empresa: number,
    @Param('idProyecto') id_proyecto: number,
  ): Promise<{ success: boolean }> {
    return this.projectsService.addProyectoToEmpresa(id_empresa, id_proyecto);
  }

  // Actualizar estado de tema
  @Patch('temas/:idTema')
  async patchUpdateTemaEstado(
    @Param('idTema') id_tema: number,
    @Body() dto: { estado: string },
  ): Promise<{ success: boolean }> {
    return this.projectsService.updateTemaEstado(id_tema, dto);
  }
}