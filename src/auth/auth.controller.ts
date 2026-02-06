import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService, // 👈 aquí lo agregas
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto);

    if (!token) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return { access_token: token };
  }
  @Post('refresh')
    async refresh(@Body('refresh_token') token: string) {
      try {
        const payload = this.jwtService.verify(token);
        return {
          access_token: this.jwtService.sign({ sub: payload.sub, email: payload.email }, { expiresIn: '1h' }),
        };
      } catch {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }
    }
}