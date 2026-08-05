export declare class CreateChatDto {
    type: 'PRIVATE' | 'GROUP';
    memberIds: string[];
    title?: string;
}
