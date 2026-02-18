import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { Empresa, Proyecto, Tema } from './entities/project.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /* =====================================================
     EMPRESAS
  ===================================================== */

  @Get('empresas')
  async getEmpresas(): Promise<Empresa[]> {
    return this.projectsService.getEmpresas();
  }

  @Post('registrar-empresa')
  async postRegistrarEmpresa(
    @Body() dto: { nombre: string },
  ): Promise<{ success: boolean }> {
    return this.projectsService.createEmpresa(dto);
  }

  /* =====================================================
     PROYECTOS
  ===================================================== */

  @Get('proyectos')
  async getAllProyectos(): Promise<Proyecto[]> {
    return this.projectsService.getAllProyectos();
  }

  @Get('proyectos/:idProyecto')
  async getProyectoById(
    @Param('idProyecto', ParseIntPipe) id: number,
  ): Promise<Proyecto> {
    return this.projectsService.getProyectoById(id);
  }

  @Post('crear-proyecto')
  async postCrearProyecto(
    @Body() dto: { nombre: string },
  ): Promise<{ success: boolean; id_proyecto: number }> {
    return this.projectsService.createProyecto(dto);
  }

 /* @Get('empresas/:idEmpresa/proyectos')
  async getProyectosByEmpresa(
    @Param('idEmpresa', ParseIntPipe) id: number,
  ): Promise<Proyecto[]> {
    return this.projectsService.getProyectosByEmpresa(id);
  }*/

  @Post('empresas/:idEmpresa/agregar-proyecto/:idProyecto')
  async postAgregarProyectoToEmpresa(
    @Param('idEmpresa', ParseIntPipe) id_empresa: number,
    @Param('idProyecto', ParseIntPipe) id_proyecto: number,
  ): Promise<{ success: boolean }> {
    return this.projectsService.addProyectoToEmpresa(
      id_empresa,
      id_proyecto,
    );
  }

  /* =====================================================
     ETAPAS
  ===================================================== */
  @Get('proyectos/:idProyecto/etapas')
async getEtapasByProyecto(
  @Param('idProyecto', ParseIntPipe) id_proyecto: number,
  @Query('id_empresa', ParseIntPipe) id_empresa: number,
) {
  return this.projectsService.getEtapasByProyecto(
    id_proyecto,
    id_empresa,
  );
}



  @Post('crear-etapa')
  async postCrearEtapa(
    @Body() dto: { nombre: string; id_proyecto: number },
  ): Promise<{ success: boolean }> {
    return this.projectsService.createEtapa(dto);
  }

  /* =====================================================
     TEMAS
  ===================================================== */

  @Get('etapas/:idEtapa/temas')
async getTemasByEtapa(
  @Param('idEtapa', ParseIntPipe) id_etapa: number,
  @Query('id_empresa', ParseIntPipe) id_empresa: number,
  @Query('id_proyecto', ParseIntPipe) id_proyecto: number,
) {
  return this.projectsService.getTemasByEtapa(
    id_etapa,
    id_empresa,
    id_proyecto,
  );
}


  @Post('crear-tema')
  async postCrearTema(
    @Body()
    dto: {
      nombre: string;
      id_proyecto: number;
      id_etapa: number;
    },
  ): Promise<{ success: boolean }> {
    return this.projectsService.createTema(dto);
  }



    /* =====================================================
     SUBTEMAS
  ===================================================== */

@Get('temas/:idTema/subtemas')
async getSubtemasByTema(
  @Param('idTema', ParseIntPipe) id_tema: number,
  @Query('id_empresa', ParseIntPipe) id_empresa: number,
  @Query('id_proyecto', ParseIntPipe) id_proyecto: number,
) {
  return this.projectsService.getSubtemasByTema(
    id_tema,
    id_empresa,
    id_proyecto,
  );
}


  @Post('crear-subtema')
  async postCrearSubtema(
    @Body()
    dto: {
      nombre: string;
      id_tema: number;
    },
  ): Promise<{ success: boolean }> {
    return this.projectsService.createSubtema(dto);
  }


  /* =====================================================
     ACTUALIZAR ESTADO (CALIFICACION)
  ===================================================== */

  @Patch('actualizar-estado')
  async patchUpdateEstado(
    @Body()
    dto: {
      id_empresa: number;
      id_proyecto: number;
      id_etapa?: number;
      id_tema?: number;
      id_subtema?: number;
      estado: 'done' | 'pending' | 'none';
    },
  ) {
    return this.projectsService.updateEstadoGeneral(dto);
  }

}
