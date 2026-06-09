import { BlockEntry } from "@/classes/BlockEntry";
import { BlockEntryImp } from "@/interfaces/BlockEntryImp";
import { parseResultsBlockEntry } from "@/utils";

export async function getBlockEntryList(): Promise<BlockEntry[]>{
    const result = await new Promise<{ blockList?: BlockEntryImp[] }>((resolve, reject) => {
        try {
            browser.storage.local.get(["blockList"])
            .then(resolve)
            .catch(reject as any);
        } catch (err) {
            reject(err);
        }
    });

    if (result.blockList !== undefined){
        return parseResultsBlockEntry(result.blockList);
    } else {
        console.error('ERRO: getBlockEntryList retorna undefined => []')
        return parseResultsBlockEntry([]);
    }
}

export function setBlockEntryList(blocklist: BlockEntry[]): void {
    try {
        browser.storage.local.set({
            blockList: blocklist,
        }, () => {
            console.log('setBlockEntry: Updated ^^')
        });
    } catch (err) {
        console.error(err)
    }
    
}

// {{`${Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60 * 60))}h${Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60)) - (Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60 * 60)) * 60)}m`}}

/*
{
  "domainName": "youtube.com",
  "blockedUntil": "2000-02-01T02:00:00.000Z",
  "blockHours": [],
  "blockWeekDays": [],
  "dailyLimit": false,
  "dailyLimitTime": 86400000,
  "lastAccess": "2026-06-01T18:30:29.395Z",
  "accessTime": {
    "total": 0,
    "today": 0,
    "curWeek": 0,
    "lastWeek": 0,
    "curMonth": 0,
    "lastMonth": 0,
    "lastUpdate": "2026-06-01T18:30:29.395Z"
  }
}*/