import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, createHmac } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Session } from './session.entity';

interface SessionTokenPair {
  session: Session;
  refreshToken: string;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    private readonly configService: ConfigService,
  ) {}

  async createForUser(user: User): Promise<SessionTokenPair> {
    const refreshToken = randomBytes(64).toString('hex');
    const session = this.sessionsRepository.create({
      user,
      userId: user.id,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      expiresAt: this.getRefreshTokenExpirationDate(),
      revokedAt: null,
      replacedBySessionId: null,
    });

    return {
      session: await this.sessionsRepository.save(session),
      refreshToken,
    };
  }

  async findActiveByRefreshToken(refreshToken: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: {
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return session;
  }

  async rotate(refreshToken: string): Promise<SessionTokenPair> {
    const currentSession = await this.findActiveByRefreshToken(refreshToken);
    const newSessionPair = await this.createForUser(currentSession.user);

    currentSession.revokedAt = new Date();
    currentSession.replacedBySessionId = newSessionPair.session.id;
    await this.sessionsRepository.save(currentSession);

    return newSessionPair;
  }

  async revokeByRefreshToken(refreshToken: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({
      where: {
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: IsNull(),
      },
    });

    if (!session) {
      return;
    }

    session.revokedAt = new Date();
    await this.sessionsRepository.save(session);
  }

  private hashRefreshToken(refreshToken: string): string {
    const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    return createHmac('sha256', secret).update(refreshToken).digest('hex');
  }

  private getRefreshTokenExpirationDate(): Date {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const expirationDate = new Date();
    expirationDate.setSeconds(
      expirationDate.getSeconds() + this.parseExpiresInToSeconds(expiresIn),
    );

    return expirationDate;
  }

  private parseExpiresInToSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 7 * 24 * 60 * 60;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * multipliers[unit];
  }
}
