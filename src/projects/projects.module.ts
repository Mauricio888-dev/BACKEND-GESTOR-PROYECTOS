import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { Empresa, Tema, Proyecto, Usuario, EmpresaProyectoTema, EmpresaProyecto } from './entities/project.entity';

import { ProjectsService } from './projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa, Proyecto, Tema, Usuario, EmpresaProyectoTema, EmpresaProyecto])],
  controllers: [ProjectsController],
  providers: [ProjectsService], // 👈 aquí registras tu servicio/repositorio
  //exports: [ProjectsService],   // si lo necesitas en otros módulos
  exports: [TypeOrmModule],
})
export class ProjectsModule {}