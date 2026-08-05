import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private messaging;
    private configured;
    constructor(config: ConfigService);
    onModuleInit(): void;
    sendNewMessage(pushToken: string | null, params: {
        senderName: string;
        text: string;
        chatId: string;
    }): Promise<void>;
}
