export interface BlockEntry {
    name: string;
    url: string;
    isActive: boolean;
    blockedUntil: Date;
    blockHours: Array<[string, string]>;
    blockWeekDays: Array<[string, string]>;
    lastAccess: Date;
    accessTime: Number;
}