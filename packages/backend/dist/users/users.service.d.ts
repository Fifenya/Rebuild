import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    search(query: string): Promise<{
        username: string;
        displayName: string;
        id: string;
        avatarUrl: string;
        onlineStatus: string;
        lastSeenAt: Date;
        bio: string;
        isVerified: never;
    }[]>;
    findById(id: string): Promise<{
        username: string;
        displayName: string;
        id: string;
        avatarUrl: string;
        onlineStatus: string;
        lastSeenAt: Date;
        bio: string;
        isVerified: never;
    }>;
    updateProfile(id: string, data: {
        displayName?: string;
        bio?: string;
        avatarUrl?: string;
    }): Promise<{
        username: string;
        displayName: string;
        id: string;
        avatarUrl: string;
        onlineStatus: string;
        lastSeenAt: Date;
        bio: string;
        isVerified: never;
    }>;
    setOnlineStatus(id: string, onlineStatus: 'online' | 'offline'): Promise<{
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
    setPushToken(id: string, token: string): Promise<{
        ok: boolean;
    }>;
}
