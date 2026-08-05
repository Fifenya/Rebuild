import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
export declare class ChatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(currentUserId: string, dto: CreateChatDto): Promise<{
        id: any;
        type: any;
        title: any;
        avatarUrl: any;
        members: any;
        lastMessage: any;
        updatedAt: any;
    }>;
    listForUser(userId: string): Promise<{
        id: any;
        type: any;
        title: any;
        avatarUrl: any;
        members: any;
        lastMessage: any;
        updatedAt: any;
    }[]>;
    findOneForUser(chatId: string, userId: string): Promise<{
        id: any;
        type: any;
        title: any;
        avatarUrl: any;
        members: any;
        lastMessage: any;
        updatedAt: any;
    }>;
    assertMember(chatId: string, userId: string): Promise<{
        id: string;
        role: string;
        joinedAt: Date;
        userId: string;
        chatId: string;
    }>;
    private chatInclude;
    private serialize;
}
