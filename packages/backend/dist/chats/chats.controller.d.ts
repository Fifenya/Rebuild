import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
export declare class ChatsController {
    private readonly chatsService;
    constructor(chatsService: ChatsService);
    create(user: any, dto: CreateChatDto): Promise<{
        id: any;
        type: any;
        title: any;
        avatarUrl: any;
        members: any;
        lastMessage: any;
        updatedAt: any;
    }>;
    list(user: any): Promise<{
        id: any;
        type: any;
        title: any;
        avatarUrl: any;
        members: any;
        lastMessage: any;
        updatedAt: any;
    }[]>;
    findOne(user: any, id: string): Promise<{
        id: any;
        type: any;
        title: any;
        avatarUrl: any;
        members: any;
        lastMessage: any;
        updatedAt: any;
    }>;
}
