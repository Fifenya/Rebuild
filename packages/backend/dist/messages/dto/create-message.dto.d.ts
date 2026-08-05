import { AttachmentDto } from './attachment.dto';
export declare class CreateMessageDto {
    text?: string;
    replyToId?: string;
    attachments?: AttachmentDto[];
}
