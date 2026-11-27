import type { BlockEntryAccessTime } from "./BlockEntryAccessTime";
import type { BlockWeekDays } from "./BlockWeekDays";

export interface BlockEntryImp {
    domainName: string,
    blockedUntil: Date,
    blockHours: [string,string][],
    blockWeekDays: BlockWeekDays,
    dailyLimit: Boolean,
    dailyLimitTime: number,
    lastAccess: Date,
    accessTime: BlockEntryAccessTime,
    shortBlock: boolean,
    shortBlockAccessTime: number,
    shortBlockLimit: number,
    shortBlockDuration: number,
    shortBlockedUntil: Date,
    doomScrollingProtection: boolean,
    doomScrollingRate: number,

    autoPlayBlocker: boolean,
}
