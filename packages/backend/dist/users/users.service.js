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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PUBLIC_USER_SELECT = {
    id: true,
    username: true,
    displayName: true,
    bio: true,
    avatarUrl: true,
    isVerified: true,
    onlineStatus: true,
    lastSeenAt: true,
};
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query) {
        if (!query || query.trim().length === 0)
            return [];
        return this.prisma.user.findMany({
            where: { username: { contains: query } },
            select: PUBLIC_USER_SELECT,
            take: 20,
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: PUBLIC_USER_SELECT,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: PUBLIC_USER_SELECT,
        });
    }
    async setOnlineStatus(id, onlineStatus) {
        return this.prisma.user.update({
            where: { id },
            data: {
                onlineStatus,
                lastSeenAt: onlineStatus === 'offline' ? new Date() : null,
            },
        });
    }
    async setPushToken(id, token) {
        await this.prisma.user.update({ where: { id }, data: { pushToken: token } });
        return { ok: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map