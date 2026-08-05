export declare class AttachmentDto {
    type: 'image' | 'video' | 'voice' | 'file';
    url: string;
    size?: number;
    mimeType?: string;
    duration?: number;
}
