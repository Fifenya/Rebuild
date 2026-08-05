"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chats_service_1 = require("../chats/chats.service");
const SENDER_SELECT = { id: true, username: true, displayName: true, avatarUrl: true };
let MessagesService = class MessagesService {
    constructor(prisma, chatsService) {
        this.prisma = prisma;
        this.chatsService = chatsService;
    }
    async create(chatId, senderId, dto) {
        await this.chatsService.assertMember(chatId, senderId);
        if (!dto.text && (!dto.attachments || dto.attachments.length === 0)) {
            throw new common_1.BadRequestException('Message must have text or at least one attachment');
        }
        const message = await this.prisma.message.create({
            data: {
                chatId,
                senderId,
                text: dto.text,
                replyToId: dto.replyToId,
                attachments: dto.attachments
                    ? {
                        create: dto.attachments.map((a) => ({
                            type: a.type,
                            url: a.url,
                            size: a.size,
                            mimeType: a.mimeType,
                            duration: a.duration,
                        })),
                    }
                    : undefined,
            },
            include: { sender: { select: SENDER_SELECT }, reactions: true, attachments: true },
        });
        await this.prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async listForChat(chatId, userId, cursor, take = 50) {
        await this.chatsService.assertMember(chatId, userId);
        const messages = await this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'desc' },
            take,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: { sender: { select: SENDER_SELECT }, reactions: true, attachments: true },
        });
        return messages.reverse();
    }
    async edit(messageId, userId, dto) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.isDeleted)
            throw new common_1.NotFoundException('Message not found');
        if (message.senderId !== userId)
            throw new common_1.ForbiddenException('You can only edit your own messages');
        return this.prisma.message.update({
            where: { id: messageId },
            data: { text: dto.text, editedAt: new Date() },
            include: { sender: { select: SENDER_SELECT }, reactions: true },
        });
    }
    async remove(messageId, userId) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.isDeleted)
            throw new common_1.NotFoundException('Message not found');
        if (message.senderId !== userId)
            throw new common_1.ForbiddenException('You can only delete your own messages');
        return this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true, deletedAt: new Date(), text: null },
        });
    }
    async react(messageId, userId, emoji) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.isDeleted)
            throw new common_1.NotFoundException('Message not found');
        await this.chatsService.assertMember(message.chatId, userId);
        const existing = await this.prisma.messageReaction.findUnique({
            where: { messageId_userId_emoji: { messageId, userId, emoji } },
        });
        if (existing) {
            await this.prisma.messageReaction.delete({ where: { id: existing.id } });
            return { toggled: 'off', emoji, messageId, chatId: message.chatId, userId };
        }
        await this.prisma.messageReaction.create({ data: { messageId, userId, emoji } });
        return { toggled: 'on', emoji, messageId, chatId: message.chatId, userId };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chats_service_1.ChatsService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map