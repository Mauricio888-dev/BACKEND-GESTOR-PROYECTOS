import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { Empresa, Tema, Proyecto } from './entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa, Proyecto, Tema])],
  controllers: [ProjectsController],
})
export class ProjectsModule {}