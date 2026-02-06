import { Injectable } from '@nestjs/common';
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

  async validateUser(/*email: string,*/nombre:string, password: string): Promise<Usuario | null> {
    const user = await this.userRepo.findOne({ where: { nombre } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string } | null> {
  const user = await this.validateUser(/*dto.email,*/dto.nombre, dto.password);
  if (!user) return null;

  const payload = { sub: user.id_usuario, email: user.email };

  return {
    access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),   // token corto
    refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }), // token largo
  };
}
}