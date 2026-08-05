export declare class UploadsController {
    upload(file: Express.Multer.File): {
        url: string;
        type: string;
        size: number;
        mimeType: string;
    };
}
