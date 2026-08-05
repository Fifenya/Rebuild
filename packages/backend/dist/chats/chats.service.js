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
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatsService = class ChatsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(currentUserId, dto) {
        const memberIds = Array.from(new Set([currentUserId, ...dto.memberIds]));
        if (dto.type === 'PRIVATE') {
            if (memberIds.length !== 2) {
                throw new common_1.BadRequestException('Private chats must have exactly two members');
            }
            const [a, b] = memberIds;
            const existing = await this.prisma.chat.findFirst({
                where: {
                    type: 'PRIVATE',
                    AND: [
                        { members: { some: { userId: a } } },
                        { members: { some: { userId: b } } },
                    ],
                },
                include: this.chatInclude(),
            });
            if (existing)
                return this.serialize(existing, currentUserId);
        }
        if (dto.type === 'GROUP' && memberIds.length < 2) {
            throw new common_1.BadRequestException('Group chats need at least two members');
        }
        const chat = await this.prisma.chat.create({
            data: {
                type: dto.type,
                title: dto.type === 'GROUP' ? dto.title ?? 'New group' : null,
                members: {
                    create: memberIds.map((userId) => ({
                        userId,
                        role: userId === currentUserId && dto.type === 'GROUP' ? 'OWNER' : 'MEMBER',
                    })),
                },
            },
            include: this.chatInclude(),
        });
        return this.serialize(chat, currentUserId);
    }
    async listForUser(userId) {
        const chats = await this.prisma.chat.findMany({
            where: { members: { some: { userId } } },
            include: this.chatInclude(),
            orderBy: { updatedAt: 'desc' },
        });
        return chats.map((c) => this.serialize(c, userId));
    }
    async findOneForUser(chatId, userId) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
            include: this.chatInclude(),
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat not found');
        if (!chat.members.some((m) => m.userId === userId)) {
            throw new common_1.ForbiddenException('You are not a member of this chat');
        }
        return this.serialize(chat, userId);
    }
    async assertMember(chatId, userId) {
        const member = await this.prisma.chatMember.findUnique({
            where: { userId_chatId: { userId, chatId } },
        });
        if (!member)
            throw new common_1.ForbiddenException('You are not a member of this chat');
        return member;
    }
    chatInclude() {
        return {
            members: { include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, onlineStatus: true } } } },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: { sender: { select: { id: true, username: true, displayName: true } } },
            },
        };
    }
    serialize(chat, currentUserId) {
        return {
            id: chat.id,
            type: chat.type,
            title: chat.type === 'PRIVATE'
                ? chat.members.find((m) => m.userId !== currentUserId)?.user?.displayName ??
                    chat.members.find((m) => m.userId !== currentUserId)?.user?.username
                : chat.title,
            avatarUrl: chat.type === 'PRIVATE'
                ? chat.members.find((m) => m.userId !== currentUserId)?.user?.avatarUrl
                : chat.avatarUrl,
            members: chat.members.map((m) => ({
                userId: m.userId,
                role: m.role,
                user: m.user,
            })),
            lastMessage: chat.messages?.[0] ?? null,
            updatedAt: chat.updatedAt,
        };
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map