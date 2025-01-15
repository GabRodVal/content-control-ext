export interface BlockList {
    name: string;
    blockedSites: Array<string>;
    isActive: boolean;
    blockedUntil: Date;
    blockIntervals: Array<[string, string]>;
    accessDay: Date;
    accessTime: Number;
  }