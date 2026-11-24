import { BlockEntry } from "@/classes/BlockEntry";
import { BlockEntryImp } from "@/interfaces/BlockEntryImp";

/*async function getCurrentDomain(): Promise<string> {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0) {
            const tabUrl: string | undefined = tabs[0]?.url;
            if (tabUrl) {
                const url = new URL(tabUrl);
                const domain = url.hostname;
                const domainParts = domain.split(".").reverse();
                if (domainParts.length > 1) {
                    return `${domainParts[1]}.${domainParts[0]}`;
                }
            } else {
                console.error("URL indefinida");
                return "N/A";
            }
        }
        return "N/A";
    } catch (error) {
        console.error("Erro ao acessar domínio da aba:", error);
        return "N/A";
    }
}*/

export function cleanDomainName(dName: string){

    const validationReg = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/m;
    //const validationReg = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/igm


    const url = new URL(dName);
    const domain = url.hostname;
    const domainParts = domain.split(".").reverse();
    
    if (domainParts.length > 1) {
        const cdName = `${domainParts[1]}.${domainParts[0]}`;

        if (validationReg.test(cdName)) {
            return cdName
        }

    }

    return 'err'
}

export function parseResultsBlockEntry(res:BlockEntryImp[]): Array<BlockEntry>{
    var blockEntryArray: BlockEntry[] = []

    if(res === undefined){
        console.error('ERRO: Utils - ParseResultsBlockEntry => ', res)
        return [];
    }

    for (var f = 0; f < res.length; f++){

        console.log(`ParseRBE:${res[f].domainName} - SB:${res[f].shortBlock}`)

        blockEntryArray.push(new BlockEntry(
            res[f].domainName,
            res[f].blockedUntil,
            res[f].blockHours,
            res[f].blockWeekDays,
            res[f].dailyLimit,
            res[f].dailyLimitTime,
            res[f].lastAccess,
            res[f].accessTime,
            res[f].shortBlock,
            res[f].shortBlockAccessTime,
            res[f].shortBlockLimit,
            res[f].shortBlockDuration,
            res[f].shortBlockedUntil,
            res[f].doomScrollingProtection,
            res[f].doomScrollingRate,
            res[f].autoPlayBlocker
        ))
    }

    return blockEntryArray;
}

export function formatHoursMinutes(ms: number): string {
    let hours = Math.floor(ms / (1000 * 60 * 60))
    let minutes = Math.floor(ms / (1000 * 60)) - (Math.floor(ms / (1000 * 60 * 60))*60)

    if(hours > 0){
        if(minutes > 0){
            return `${hours}h${minutes}m`
        } else {
            return `${hours}h`
        }
    } else {
        return `${minutes}m`
    }
// {{`${Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60 * 60))}h${Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60)) - (Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60 * 60)) * 60)}m`}}
}

export function clearAllIntervals(timOuts: Array<NodeJS.Timeout>): Array<NodeJS.Timeout> {
    var tLen = timOuts.length
    for (var f = 0; f<tLen; f++){
        let oldEvent = timOuts.pop()
        if (oldEvent !== undefined){
            clearInterval(oldEvent);
        }
    }

    return timOuts
}

export function verifyBlockType(bt:string): string{
    if (bt === 'none'){
        return '000'
    }else if (bt === 'blockUntil'){
        return '001'
    } else if (bt === 'blockHour') {
        return '010'
    } else if (bt === 'timeUp') {
        return '011'
    } else if (bt === 'delayAccess') {
        return '100'
    } else if (bt === 'shortBlock') {
        return '101'
    } else if (bt === 'malicious') {
        return '110'
    } else if (bt === 'other') {
        return '111'
    }

    console.warn('BlockType Inválido')
    return 'NAN'
}

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