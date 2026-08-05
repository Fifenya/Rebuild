import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        username: string;
    }): Promise<{
        username: string;
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
export {};
