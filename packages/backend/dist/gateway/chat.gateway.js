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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const chats_service_1 = require("../chats/chats.service");
const messages_service_1 = require("../messages/messages.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    constructor(jwt, config, prisma, chatsService, messagesService, notifications) {
        this.jwt = jwt;
        this.config = config;
        this.prisma = prisma;
        this.chatsService = chatsService;
        this.messagesService = messagesService;
        this.notifications = notifications;
        this.logger = new common_1.Logger(ChatGateway_1.name);
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token)
                throw new Error('No token provided');
            const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') });
            client.userId = payload.sub;
            client.join(`user:${client.userId}`);
            const chats = await this.chatsService.listForUser(client.userId);
            chats.forEach((chat) => client.join(`chat:${chat.id}`));
            await this.prisma.user.update({
                where: { id: client.userId },
                data: { onlineStatus: 'online' },
            });
            this.broadcastPresence(client.userId, 'online');
        }
        catch (err) {
            this.logger.warn(`Rejected socket connection: ${err.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (!client.userId)
            return;
        const remaining = await this.server.in(`user:${client.userId}`).fetchSockets();
        if (remaining.length === 0) {
            await this.prisma.user.update({
                where: { id: client.userId },
                data: { onlineStatus: 'offline', lastSeenAt: new Date() },
            });
            this.broadcastPresence(client.userId, 'offline');
        }
    }
    broadcastPresence(userId, status) {
        this.server.emit('presence:update', { userId, status });
    }
    async onMessageSend(client, body) {
        if (!client.userId)
            return;
        const message = await this.messagesService.create(body.chatId, client.userId, {
            text: body.text,
            replyToId: body.replyToId,
            attachments: body.attachments,
        });
        this.server.to(`chat:${body.chatId}`).emit('message:new', message);
        this.pushToOfflineMembers(body.chatId, client.userId, message);
        return message;
    }
    async pushToOfflineMembers(chatId, senderId, message) {
        try {
            const chat = await this.chatsService.findOneForUser(chatId, senderId);
            const sender = chat.members.find((m) => m.userId === senderId)?.user;
            const onlineSocketUserIds = new Set((await this.server.in(`chat:${chatId}`).fetchSockets()).map((s) => s.userId));
            for (const member of chat.members) {
                if (member.userId === senderId)
                    continue;
                if (onlineSocketUserIds.has(member.userId))
                    continue;
                const recipient = await this.prisma.user.findUnique({ where: { id: member.userId } });
                if (!recipient?.pushToken)
                    continue;
                await this.notifications.sendNewMessage(recipient.pushToken, {
                    senderName: sender?.displayName ?? sender?.username ?? 'Nexus',
                    text: message.text ?? '📎 Вложение',
                    chatId,
                });
            }
        }
        catch (err) {
            this.logger.warn(`Push fan-out failed: ${err.message}`);
        }
    }
    async onMessageEdit(client, body) {
        if (!client.userId)
            return;
        const message = await this.messagesService.edit(body.messageId, client.userId, { text: body.text });
        this.server.to(`chat:${body.chatId}`).emit('message:updated', message);
        return message;
    }
    async onMessageDelete(client, body) {
        if (!client.userId)
            return;
        const message = await this.messagesService.remove(body.messageId, client.userId);
        this.server.to(`chat:${body.chatId}`).emit('message:deleted', { id: message.id, chatId: body.chatId });
        return { ok: true };
    }
    async onMessageReact(client, body) {
        if (!client.userId)
            return;
        const result = await this.messagesService.react(body.messageId, client.userId, body.emoji);
        this.server.to(`chat:${result.chatId}`).emit('message:reaction', result);
        return result;
    }
    onTypingStart(client, body) {
        if (!client.userId)
            return;
        client.to(`chat:${body.chatId}`).emit('typing:update', {
            chatId: body.chatId,
            userId: client.userId,
            isTyping: true,
        });
    }
    onTypingStop(client, body) {
        if (!client.userId)
            return;
        client.to(`chat:${body.chatId}`).emit('typing:update', {
            chatId: body.chatId,
            userId: client.userId,
            isTyping: false,
        });
    }
    async onChatJoin(client, body) {
        if (!client.userId)
            return;
        await this.chatsService.assertMember(body.chatId, client.userId);
        client.join(`chat:${body.chatId}`);
        return { ok: true };
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onMessageSend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:edit'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onMessageEdit", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:delete'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onMessageDelete", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:react'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onMessageReact", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "onTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "onTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onChatJoin", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: process.env.CORS_ORIGIN ?? '*', credentials: true },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService,
        chats_service_1.ChatsService,
        messages_service_1.MessagesService,
        notifications_service_1.NotificationsService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map