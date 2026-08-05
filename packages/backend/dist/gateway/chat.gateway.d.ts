import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { MessagesService } from '../messages/messages.service';
import { NotificationsService } from '../notifications/notifications.service';
interface AuthedSocket extends Socket {
    userId?: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwt;
    private readonly config;
    private readonly prisma;
    private readonly chatsService;
    private readonly messagesService;
    private readonly notifications;
    server: Server;
    private readonly logger;
    constructor(jwt: JwtService, config: ConfigService, prisma: PrismaService, chatsService: ChatsService, messagesService: MessagesService, notifications: NotificationsService);
    handleConnection(client: AuthedSocket): Promise<void>;
    handleDisconnect(client: AuthedSocket): Promise<void>;
    private broadcastPresence;
    onMessageSend(client: AuthedSocket, body: {
        chatId: string;
        text?: string;
        replyToId?: string;
        attachments?: any[];
    }): Promise<{
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
    private pushToOfflineMembers;
    onMessageEdit(client: AuthedSocket, body: {
        chatId: string;
        messageId: string;
        text: string;
    }): Promise<{
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
    onMessageDelete(client: AuthedSocket, body: {
        chatId: string;
        messageId: string;
    }): Promise<{
        ok: boolean;
    }>;
    onMessageReact(client: AuthedSocket, body: {
        messageId: string;
        emoji: string;
    }): Promise<{
        toggled: string;
        emoji: string;
        messageId: string;
        chatId: string;
        userId: string;
    }>;
    onTypingStart(client: AuthedSocket, body: {
        chatId: string;
    }): void;
    onTypingStop(client: AuthedSocket, body: {
        chatId: string;
    }): void;
    onChatJoin(client: AuthedSocket, body: {
        chatId: string;
    }): Promise<{
        ok: boolean;
    }>;
}
export {};
