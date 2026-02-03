import { DataSource } from 'typeorm';
import { Empresa, Tema, Usuario, Proyecto } from '../../projects/entities/project.entity';

export async function runSeed(dataSource: DataSource) {
  // Repositorios
  const empresaRepo = dataSource.getRepository(Empresa);
  const proyectoRepo = dataSource.getRepository(Proyecto);
  const usuarioRepo = dataSource.getRepository(Usuario);
  const temaRepo = dataSource.getRepository(Tema);

  // 1. Crear empresa inicial
  const empresa = await empresaRepo.save({
    nombre: 'Empresa Demo',
  });

  // 2. Crear proyecto inicial
  const proyecto = await proyectoRepo.save({
    nombre_proyecto: 'Proyecto Inicial',
    id_empresa: empresa.id_empresa,
  });

  // 3. Crear usuario administrador
  const admin = await usuarioRepo.save({
    nombre: 'Administrador',
    email: 'admin@demo.com',
    rol: 'admin',
  });

  // 4. Crear un tema inicial
  await temaRepo.save({
    nombre_tema: 'Primer Tema',
    estado: 'sin registro',
    descripcion: 'Tema de prueba para el proyecto inicial',
    id_proyecto: proyecto.id_proyecto,
  });

  console.log('✅ Seed ejecutado: Empresa, Proyecto, Usuario Admin y Tema creados');
}