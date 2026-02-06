
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /*@IsEmail()
  email: string;*/

  @IsString()
  nombre: string
  @MinLength(6)
  password: string;
}