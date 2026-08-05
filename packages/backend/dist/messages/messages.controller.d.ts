import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(user: any, chatId: string, dto: CreateMessageDto): Promise<{
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
    list(user: any, chatId: string, cursor?: string): Promise<{
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
    edit(user: any, id: string, dto: UpdateMessageDto): Promise<{
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
    remove(user: any, id: string): Promise<{
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
    react(user: any, id: string, emoji: string): Promise<{
        toggled: string;
        emoji: string;
        messageId: string;
        chatId: string;
        userId: string;
    }>;
}
