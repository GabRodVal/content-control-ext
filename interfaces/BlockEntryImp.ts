import { BlockEntryAccessTime } from "./BlockEntryAccessTime";

export interface BlockEntryImp {
    domainName: string,
    blockedUntil: Date,
    blockHours: [string,string][],
    blockWeekDays: string[],
    dailyLimit: Boolean,
    dailyLimitTime: number,
    lastAccess: Date,
    accessTime: BlockEntryAccessTime
}
