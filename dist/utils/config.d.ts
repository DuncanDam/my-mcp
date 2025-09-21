export declare const config: {
    readonly excel: {
        readonly databasePath: string;
        readonly backupEnabled: boolean;
        readonly autoSave: boolean;
    };
    readonly google: {
        readonly visionApiKey: string | undefined;
    };
    readonly scraper: {
        readonly userAgent: string;
        readonly timeout: number;
        readonly rateLimit: number;
    };
    readonly ocr: {
        readonly fallbackEnabled: boolean;
    };
    readonly server: {
        readonly port: number;
        readonly logLevel: string;
    };
    readonly maxContentLength: number;
    readonly team: {
        readonly name: string;
        readonly serverName: string;
    };
};
