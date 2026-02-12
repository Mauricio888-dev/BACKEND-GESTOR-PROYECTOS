import { Body, Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Empresa, Tema, Proyecto } from './entities/project.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Obtener todas las empresas
  @UseGuards(JwtAuthGuard)
  @Get('empresas')
  async getEmpresas(): Promise<Empresa[]> {
    return this.projectsService.getEmpresas();
  }

  // Obtener proyectos por empresa
  @UseGuards(JwtAuthGuard)
  @Get('empresas/:idEmpresa/proyectos')
  async getProyectosByEmpresa(@Param('idEmpresa') id: number): Promise<Proyecto[]> {
    return this.projectsService.getProyectosByEmpresa(id);
  }

  // Obtener todos los proyectos existentes
  @UseGuards(JwtAuthGuard)
  @Get('proyectos')
  async getAllProyectos(): Promise<Proyecto[]> {
    return this.projectsService.getAllProyectos();
  }


  // Obtener un proyecto por ID
  @UseGuards(JwtAuthGuard)
  @Get('proyectos/:idProyecto')
  async getProyectoById(@Param('idProyecto') id: number): Promise<Proyecto> {
    return this.projectsService.getProyectoById(id);
  }


  // Obtener temas de un proyecto sin importar empresa
  @UseGuards(JwtAuthGuard)
  @Get('proyectos/:idProyecto/temas')
  async getTemasByProyecto(@Param('idProyecto') id_proyecto: number): Promise<Tema[]> {
    return this.projectsService.getTemasByProyecto(id_proyecto);
  }

  // Obtener temas por proyecto
  @UseGuards(JwtAuthGuard)
  @Get('empresas/:idEmpresa/proyectos/:idProyecto/temas')
  async getTemasByEmpresaProyecto(
    @Param('idEmpresa') id_empresa: number,
    @Param('idProyecto') id_proyecto: number,
  ): Promise<any[]> {
    return this.projectsService.getTemasByEmpresaProyecto(id_empresa, id_proyecto);
  }

  // Registrar empresa
  @UseGuards(JwtAuthGuard)
  @Post('registrar-empresa')
  async postRegistrarEmpresa(@Body() dto: { nombre: string }): Promise<{ success: boolean }> {
    return this.projectsService.createEmpresa(dto);
  }

  // Crear proyecto independiente
  @UseGuards(JwtAuthGuard)
  @Post('crear-proyecto')
  async postCrearProyecto(@Body() dto: { nombre_proyecto: string }): Promise<{ success: boolean }> {
    return this.projectsService.createProyecto(dto);
  }

  // Crear tema dependiente de proyecto
  @UseGuards(JwtAuthGuard)
  @Post('crear-tema')
  async postCrearTema(@Body() dto: { nombre_tema: string; id_proyecto: number }): Promise<{ success: boolean }> {
    return this.projectsService.createTema(dto);
  }

  // Agregar proyecto a empresa (ManyToMany)
  @UseGuards(JwtAuthGuard)
  @Post('empresas/:idEmpresa/agregar-proyecto/:idProyecto')
  async postAgregarProyectoToEmpresa(
    @Param('idEmpresa') id_empresa: number,
    @Param('idProyecto') id_proyecto: number,
  ): Promise<{ success: boolean }> {
    return this.projectsService.addProyectoToEmpresa(id_empresa, id_proyecto);
  }

  // Actualizar estado de tema
  // Actualizar estado de tema por empresa y proyecto
  @UseGuards(JwtAuthGuard)
  @Patch('empresas/:idEmpresa/proyectos/:idProyecto/temas/:idTema')
  async patchUpdateTemaEstado(
    @Param('idEmpresa') id_empresa: number,
    @Param('idProyecto') id_proyecto: number,
    @Param('idTema') id_tema: number,
    @Body() dto: { estado: 'realizado' | 'sin registro' | 'en proceso' },
  ): Promise<{ success: boolean }> {
    return this.projectsService.updateTemaEstado(id_empresa, id_proyecto, id_tema, dto);
  }
    // Crear y asociar un nuevo tema a un proyecto ya unido a una empresa
  @UseGuards(JwtAuthGuard)
  @Post('empresas/:idEmpresa/proyectos/:idProyecto/temas')
  async postCrearTemaEnEmpresaProyecto(
    @Param('idEmpresa') id_empresa: number,
    @Param('idProyecto') id_proyecto: number,
    @Body() dto: { nombre_tema: string },
  ): Promise<{ success: boolean }> {
    return this.projectsService.createTemaEnEmpresaProyecto(id_empresa, id_proyecto, dto);
  }
}