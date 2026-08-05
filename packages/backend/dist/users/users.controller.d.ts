import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    search(q: string): Promise<{
        username: string;
        displayName: string;
        id: string;
        avatarUrl: string;
        onlineStatus: string;
        lastSeenAt: Date;
        bio: string;
        isVerified: never;
    }[]>;
    findOne(id: string): Promise<{
        username: string;
        displayName: string;
        id: string;
        avatarUrl: string;
        onlineStatus: string;
        lastSeenAt: Date;
        bio: string;
        isVerified: never;
    }>;
    updateMe(user: any, dto: UpdateProfileDto): Promise<{
        username: string;
        displayName: string;
        id: string;
        avatarUrl: string;
        onlineStatus: string;
        lastSeenAt: Date;
        bio: string;
        isVerified: never;
    }>;
    registerPushToken(user: any, token: string): Promise<{
        ok: boolean;
    }>;
}
