import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
            bio: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
            bio: string;
        };
    }>;
    private buildAuthResponse;
    validateUserById(id: string): Promise<{
        username: string;
        password: string | null;
        displayName: string | null;
        email: string | null;
        id: string;
        phone: string;
        publicKey: string;
        avatarUrl: string | null;
        pushToken: string | null;
        onlineStatus: string | null;
        lastSeenAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
    }>;
}
