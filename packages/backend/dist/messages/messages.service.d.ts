import { PrismaService } from '../prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class MessagesService {
    private readonly prisma;
    private readonly chatsService;
    constructor(prisma: PrismaService, chatsService: ChatsService);
    create(chatId: string, senderId: string, dto: CreateMessageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string | null;
        content: string;
        senderId: string;
        isRead: boolean;
        text: string | null;
        attachments: string[];
        isDeleted: boolean;
        deletedAt: Date | null;
        editedAt: Date | null;
        receiverId: string;
    }>;
    listForChat(chatId: string, userId: string, cursor?: string, take?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string | null;
        content: string;
        senderId: string;
        isRead: boolean;
        text: string | null;
        attachments: string[];
        isDeleted: boolean;
        deletedAt: Date | null;
        editedAt: Date | null;
        receiverId: string;
    }[]>;
    edit(messageId: string, userId: string, dto: UpdateMessageDto): Promise<{
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        }[];
        sender: {
            username: string;
            displayName: string;
            id: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string | null;
        content: string;
        senderId: string;
        isRead: boolean;
        text: string | null;
        attachments: string[];
        isDeleted: boolean;
        deletedAt: Date | null;
        editedAt: Date | null;
        receiverId: string;
    }>;
    remove(messageId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string | null;
        content: string;
        senderId: string;
        isRead: boolean;
        text: string | null;
        attachments: string[];
        isDeleted: boolean;
        deletedAt: Date | null;
        editedAt: Date | null;
        receiverId: string;
    }>;
    react(messageId: string, userId: string, emoji: string): Promise<{
        toggled: string;
        emoji: string;
        messageId: string;
        chatId: string;
        userId: string;
    }>;
}
