import { BlockEntryAccessTime } from "./BlockEntryAccessTime";
import { BlockWeekDays } from "./BlockWeekDays";

export interface BlockEntryImp {
    domainName: string,
    blockedUntil: Date,
    blockHours: [string,string][],
    blockWeekDays: BlockWeekDays,
    dailyLimit: Boolean,
    dailyLimitTime: number,
    lastAccess: Date,
    accessTime: BlockEntryAccessTime
}
