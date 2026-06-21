import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SessionsService } from '../sessions/sessions.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface UserResponse {
  id: string;
  username: string;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponse> {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );

    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create(
      registerDto.username,
      passwordHash,
    );

    return this.toUserResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.createAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const { session, refreshToken: newRefreshToken } =
      await this.sessionsService.rotate(refreshToken);

    return this.createAuthResponse(session.user, newRefreshToken);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.sessionsService.revokeByRefreshToken(refreshToken);

    return { message: 'Sesión cerrada correctamente' };
  }

  private async createAuthResponse(
    user: User,
    refreshToken?: string,
  ): Promise<AuthResponse> {
    const sessionPair = refreshToken
      ? { refreshToken }
      : await this.sessionsService.createForUser(user);

    return {
      accessToken: await this.signAccessToken(user),
      refreshToken: sessionPair.refreshToken,
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
      user: this.toUserResponse(user),
    };
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
    };

    return this.jwtService.signAsync(payload);
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
