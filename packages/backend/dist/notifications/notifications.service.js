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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.messaging = null;
        this.configured = false;
    }
    onModuleInit() {
        const raw = this.config.get('FIREBASE_SERVICE_ACCOUNT_JSON');
        if (!raw) {
            this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications are disabled (will log only)');
            return;
        }
        try {
            const admin = require('firebase-admin');
            const serviceAccount = JSON.parse(raw);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            this.messaging = admin.messaging();
            this.configured = true;
            this.logger.log('Firebase push notifications configured');
        }
        catch (err) {
            this.logger.error(`Failed to initialize firebase-admin — is it installed and is the JSON valid? ${err.message}`);
        }
    }
    async sendNewMessage(pushToken, params) {
        if (!pushToken)
            return;
        if (!this.configured) {
            this.logger.debug(`[push disabled] Would notify token=${pushToken.slice(0, 8)}... : "${params.senderName}: ${params.text}"`);
            return;
        }
        try {
            await this.messaging.send({
                token: pushToken,
                notification: { title: params.senderName, body: params.text },
                data: { chatId: params.chatId },
            });
        }
        catch (err) {
            this.logger.warn(`Push send failed: ${err.message}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map