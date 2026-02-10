import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../projects/entities/project.entity'; // tu entidad Usuario
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

async validateUser(nombre: string, password: string): Promise<Usuario | null> {
    try {
      console.log('[AuthService] Validando usuario:', nombre);

      const user = await this.userRepo.findOne({ where: { nombre } });
      console.log('[AuthService] Usuario encontrado:', user);


      //if (user && await bcrypt.compare(password, user.password)) {
      if (user && password == user.password) {
        console.log('[AuthService] Password correcto para usuario:', nombre);
        return user;
      }

      console.warn('[AuthService] Credenciales inválidas para usuario:', nombre);
      return null;
    } catch (error) {
      console.error('[AuthService] Error en validateUser:', error);
      throw new InternalServerErrorException('Error interno al validar usuario');
    }
  }


  async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
      console.log('[AuthService] Intentando login con DTO:', dto);
      
      const user = await this.validateUser(dto.nombre, dto.password);
      if (!user) {
        console.warn('[AuthService] Login fallido: credenciales inválidas');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const payload = { sub: user.id_usuario, nombre: user.nombre };
      console.log('[AuthService] Payload JWT:', payload);

      const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

      console.log('[AuthService] Tokens generados correctamente');
      return { access_token, refresh_token };
    } catch (error) {
      console.error('[AuthService] Error en login:', error);
      throw new InternalServerErrorException('Error interno al iniciar sesión');
    }
  }

}