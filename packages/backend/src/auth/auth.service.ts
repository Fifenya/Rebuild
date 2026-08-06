import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('That username is already taken');
    }

    if (dto.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailTaken) {
        throw new ConflictException('That email is already in use');
      }
    }

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashed,
        displayName: dto.displayName ?? dto.username,
        email: dto.email,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.identifier }, { email: dto.identifier }],
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Incorrect identifier or password');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Incorrect identifier or password');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { onlineStatus: 'online' } });

    const accessToken = this.generateAccessToken(user.id, user.username);
    const refreshToken = await this.createRefreshTokenForUser(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.userPayload(user),
    };
  }

  private generateAccessToken(userId: string, username: string) {
    const payload = { sub: userId, username };
    return this.jwt.sign(payload);
  }

  private userPayload(user: any) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio || '',
    };
  }

  private async createRefreshTokenForUser(userId: string) {
    const raw = crypto.randomBytes(64).toString('hex');
    const hashed = await bcrypt.hash(raw, SALT_ROUNDS);
    const expiresDays = Number(this.config.get<number>('JWT_REFRESH_EXPIRES_DAYS') ?? 7);
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    const record = await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashed,
        userId,
        expiresAt,
      },
    });

    // return combined token: {id}.{secret}
    return `${record.id}.${raw}`;
  }

  async refresh(refreshTokenCombined: string) {
    if (!refreshTokenCombined) throw new BadRequestException('No refresh token provided');
    const [id, secret] = refreshTokenCombined.split('.');
    if (!id || !secret) throw new BadRequestException('Invalid refresh token format');

    const record = await this.prisma.refreshToken.findUnique({ where: { id } });
    if (!record) throw new UnauthorizedException('Invalid refresh token');

    if (record.expiresAt && record.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    const ok = await bcrypt.compare(secret, record.tokenHash);
    if (!ok) {
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException('Invalid refresh token');
    }

    // rotate: delete old and issue new
    await this.prisma.refreshToken.delete({ where: { id: record.id } });
    const newRefresh = await this.createRefreshTokenForUser(record.userId);
    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    const accessToken = this.generateAccessToken(user.id, user.username);

    return { accessToken, refreshToken: newRefresh, user: this.userPayload(user) };
  }

  async logout(refreshTokenCombined: string) {
    if (!refreshTokenCombined) return;
    const [id] = refreshTokenCombined.split('.');
    if (!id) return;
    try {
      await this.prisma.refreshToken.delete({ where: { id } });
    } catch (e) {
      // ignore
    }
  }

  async validateUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
