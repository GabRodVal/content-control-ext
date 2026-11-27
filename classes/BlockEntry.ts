import type { BlockEntryAccessTime } from "@/interfaces/BlockEntryAccessTime";
import type { BlockObject } from "@/interfaces/BlockObject";
import type { BlockWeekDays } from "@/interfaces/BlockWeekDays";
import { setBlockEntryList } from "@/storage_utils";

export class BlockEntry {
    private domainName: string;
    private blockedUntil: Date;
    private blockHours: Array<[string, string]>;
    //Fix blockWeekDays to Boolean[7]
    private blockWeekDays: BlockWeekDays;
    private dailyLimit: Boolean;
    private dailyLimitTime: number; 
    private lastAccess: Date;
    private accessTime: BlockEntryAccessTime;

    private shortBlock: boolean;
    private shortBlockAccessTime: number;
    private shortBlockLimit: number;
    private shortBlockDuration: number;
    private shortBlockedUntil: Date;

    private doomScrollingProtection: boolean;
    private doomScrollingRate: number;

    private autoPlayBlocker: boolean;

    //NOT google.com
    //NOT mail.google.com
    //NOT bing
    //NOT wikipedia

    public constructor(domainName: string,
        blockedUntil: Date = new Date(2000, 1, 1),
        blockHours: [string, string][] = [],
        blockWeekdays: BlockWeekDays = {
            blockByWeekday: false,
            wDays:{
                sunBlock: false,
                monBlock: false,
                tueBlock: false,
                wedBlock: false,
                thuBlock: false,
                friBlock: false,
                satBlock: false,
                }
        },
        dailyLimit:Boolean = false,
        dailyLimitTime: number = 24 * 60 * 60 * 1000,
        lastAccess: Date = new Date(),
        accessTime: BlockEntryAccessTime = {
            total: 0,
            today: 0,
            curWeek: 0,
            lastWeek: 0,
            curMonth: 0,
            lastMonth: 0,
            lastUpdate: new Date()
        },
        shortBlock: boolean = false,
        shortBlockAccessTime: number = 0,
        shortBlockLimit: number = 60 * 60 * 1000,
        shortBlockDuration: number = 5 * 60 * 1000,
        shortBlockedUntil: Date = new Date(0),

        doomScrollingProtection: boolean = false,
        doomScrollingRate: number = 4000.0,

        autoPlayBlocker: boolean = false
        ){
        //Resolver formatação
        this.domainName = domainName;
        this.blockedUntil =  blockedUntil;//new Date(2000, 1, 1);
        this.blockHours = blockHours;//[];
        this.blockWeekDays = blockWeekdays;//[];
        this.dailyLimit = dailyLimit;//false;
        this.dailyLimitTime = dailyLimitTime//24 * 60 * 60 * 1000;
        this.lastAccess = lastAccess;// new Date();
        this.accessTime = accessTime
        //Bloqueio Rapido
        this.shortBlock = shortBlock
        this.shortBlockAccessTime = shortBlockAccessTime
        this.shortBlockLimit = shortBlockLimit
        this.shortBlockDuration = shortBlockDuration
        this.shortBlockedUntil = shortBlockedUntil

        this.doomScrollingProtection = doomScrollingProtection
        this.doomScrollingRate = doomScrollingRate

        this.autoPlayBlocker = autoPlayBlocker

    }

    public validateName(): Boolean{
        const validationReg = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/m;
        //const validationReg = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/igm

        if (validationReg.test(this.domainName)){
            return true;
        } else {
            console.warn(`AVISO: O nome do domínio ${this.domainName} falhou durante a validação`)
            return false;
        }

    }

    public getDomainName(): string{
        return this.domainName
    }

    public getBlockedUntil() :Date{
        return this.blockedUntil
    }

    public setBlockedUntil(blUntil:Date){
        this.blockedUntil = blUntil
    }

    public getBlockHours(): Array<[string,string]>{
        return this.blockHours
    }

    public pushBlockHours(blFrom: Date, blTo: Date){
        const padHours = (hour: number): string => String(hour).padStart(2, '0');
        
        //change name?
        let oldBlockHours = this.blockHours

        let blFromFormatted = `${padHours(blFrom.getHours())}:${padHours(blFrom.getMinutes())}`;

        if (blFromFormatted.length !== 5){
            console.warn(`AVISO: blFrom contém um tamanho incorreto de caracteres: ${blFromFormatted.length}/5`)
        }

        let blToFormatted = `${padHours(blTo.getHours())}:${padHours(blTo.getMinutes())}`;

        if (blToFormatted.length !== 5) {
            console.warn(`AVISO: blTo contém um tamanho incorreto de caracteres: ${blToFormatted.length}/5`)
        }

        oldBlockHours.push([blFromFormatted, blToFormatted])

        this.blockHours = oldBlockHours
    }

    public removeBlockHours(blHours: [string, string]){
        let oldBlockHours = this.blockHours

        let newBlockHours = oldBlockHours.filter((el, id) => el !== blHours);

        this.blockHours = newBlockHours
    }

    public isInBlockingInterval(): Boolean{
        const curDate = new Date()
        let intervals = this.getBlockHours();
        let intA:string[], intB:string[], hourA:Date, hourB:Date
        hourA = new Date();
        hourB = new Date();
        for (let f = 0; f<intervals.length; f++){
            intA = intervals[f]?.[0].split(`:`)!
            intB = intervals[f]?.[1].split(`:`)!

            hourA.setHours(parseInt(intA[0]!), parseInt(intA[1]!)); 
            hourB.setHours(parseInt(intB[0]!), parseInt(intB[1]!)); 

            if (curDate > hourA && curDate < hourB){
                return true;
            }
        }

        return false
    }

    public getBlockWeekDays(): BlockWeekDays{
        return this.blockWeekDays
    }

    public setBlockWeekDays(wkDays:BlockWeekDays){
        this.blockWeekDays.blockByWeekday = wkDays.blockByWeekday
        
        this.blockWeekDays.wDays.sunBlock = wkDays.wDays.sunBlock
        this.blockWeekDays.wDays.monBlock = wkDays.wDays.monBlock
        this.blockWeekDays.wDays.tueBlock = wkDays.wDays.tueBlock
        this.blockWeekDays.wDays.wedBlock = wkDays.wDays.wedBlock
        this.blockWeekDays.wDays.thuBlock = wkDays.wDays.thuBlock
        this.blockWeekDays.wDays.friBlock = wkDays.wDays.friBlock
        this.blockWeekDays.wDays.satBlock = wkDays.wDays.satBlock
    }

    public getDailyLimit(): Boolean{
        return this.dailyLimit
    }

    public toggleDailyLimit(){
        this.dailyLimit = !this.getDailyLimit();
    }

    public getDailyLimitTime(): number{
        return this.dailyLimitTime
    }

    public setDailyLimitTime(timeLimit: number){
        this.dailyLimitTime = timeLimit;
    }

    public getLastAccess(): Date{
        return this.lastAccess
    }

    public updateLastAccess(){
        this.lastAccess = new Date();
    }

    public getAccessTime(): BlockEntryAccessTime{
        return this.accessTime
    }

    public getAndUpdateAccessTime(): BlockEntryAccessTime{
        this.updateAccessTime();
        return this.accessTime
    }

    public updateAccessTime(){
        // change to get functions?
        //const msDay = 24 * 60 * 60 * 1000;

        let oldAccessTime:BlockEntryAccessTime = this.accessTime
        
        let currently = new Date();
        let oldUpdate: Date = new Date(oldAccessTime.lastUpdate)


        if (oldUpdate.getDate() != currently.getDate()) {
            oldAccessTime.today = 0
            this.shortBlockAccessTime = 0
            
            if (Math.abs(currently.getDate() - oldUpdate.getDate()) >= 7 ||
                oldUpdate.getDay() > currently.getDay()) {
                oldAccessTime.lastWeek = oldAccessTime.curWeek;
                oldAccessTime.curWeek = 0;
            }
        }

        if (oldUpdate.getFullYear() == currently.getFullYear()){
            if (oldUpdate.getMonth() == currently.getMonth()){
            } else {
                oldAccessTime.today = 0
                oldAccessTime.lastMonth = oldAccessTime.curMonth;
                oldAccessTime.curMonth = 0;
            }
        } else {
            oldAccessTime.today = 0
            oldAccessTime.lastMonth = oldAccessTime.curMonth;
            oldAccessTime.curMonth = 0;
            this.shortBlockAccessTime = 0
        }

        oldAccessTime.lastUpdate = currently;

        this.accessTime = oldAccessTime;

    }

    public addAccessTime(milisec:number){
        this.updateAccessTime();
        this.updateLastAccess();

        this.accessTime.today    += milisec
        this.accessTime.curWeek  += milisec
        this.accessTime.curMonth += milisec

        this.shortBlockAccessTime += milisec

        this.accessTime.total    += milisec
    }

    public isBlocked(): BlockObject{
        let currently = new Date();
        let curAccessTime = this.getAccessTime()
        
        if (this.isShortBlocked()){
            return { isBlocked:true, blockType: 'shortBlock'}
        }

        if (this.getBlockedUntil() > currently){
            return { isBlocked: true, blockType: 'blockUntil'}
        }


        if (this.isInBlockingInterval()) {
            let bWkDays = this.getBlockWeekDays()
            if (bWkDays.blockByWeekday == true){
                if (currently.getDay() == 0 && bWkDays.wDays.sunBlock == true) {
                    return { isBlocked: true, blockType: 'blockHour' }
                } else if (currently.getDay() == 1 && bWkDays.wDays.monBlock == true) {
                    return { isBlocked: true, blockType: 'blockHour' }
                } else if (currently.getDay() == 2 && bWkDays.wDays.tueBlock == true) {
                    return { isBlocked: true, blockType: 'blockHour' }
                } else if (currently.getDay() == 3 && bWkDays.wDays.wedBlock == true) {
                    return { isBlocked: true, blockType: 'blockHour' }
                } else if (currently.getDay() == 4 && bWkDays.wDays.thuBlock == true) {
                    return { isBlocked: true, blockType: 'blockHour' }
                } else if (currently.getDay() == 5 && bWkDays.wDays.friBlock == true) {
                    return { isBlocked: true, blockType: 'blockHour' }
                } else if (currently.getDay() == 6 && bWkDays.wDays.satBlock == true) {
                    return { isBlocked: true, blockType: 'blockHour' }
                } else {
                    return { isBlocked: false, blockType: 'none' }
                }
            } else {
                return { isBlocked: true, blockType: 'blockHour' }
            }
        }

        if (curAccessTime.today >= this.getDailyLimitTime()){
            return { isBlocked: true, blockType: 'timeUp' }
        }

        return { isBlocked: false, blockType: 'none' }
    }

    public getShortBlock(){
        return {
            shortBlock: this.shortBlock,
            shortBlockDur: this.shortBlockDuration,
            shortBlockLimit: this.shortBlockLimit,
            shortBlockAccessTime: this.shortBlockAccessTime
        }
    }
    public setShortBlock(toBlock:boolean){
        this.shortBlock = toBlock;
    }
    public setShortBlockDuration(bDur:number){
        this.shortBlockDuration = bDur;
    }
    public setShortBlockLimit(bLim:number){
        this.shortBlockLimit = bLim;
    }


    public isShortBlocked():Boolean{        
        if (this.shortBlock){
            let currently = new Date();
            if (this.shortBlockedUntil < currently){
                if (this.shortBlockAccessTime > this.shortBlockLimit){
                    this.shortBlockedUntil = new Date(currently.getTime() + this.shortBlockDuration)
                    this.blockedUntil = this.shortBlockedUntil
                    this.shortBlockAccessTime = 0
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        } else {
            return false
        }
    }

    public blockByAutoplay(){
        if (this.getAutoplayBlockEnabled()){
            let currently = new Date();
            if (!this.isShortBlocked()){
                //Bloqueio mais curto por padrão
                console.log('AutoPlay BLOCK')
                this.shortBlockedUntil = new Date(currently.getTime() + (2 * 60 * 1000))
                this.blockedUntil = this.shortBlockedUntil
            }
        }
    }

    public checkDoomscrolling(vh:number, ph:number){
        let sr = (ph/vh) * 100.0
        if (this.getDoomscrollingBlockEnabled()){
            if (sr >= this.getDoomscrollingRate()) {
                let currently = new Date();
                this.shortBlockedUntil = new Date(currently.getTime() + this.shortBlockDuration)
                this.blockedUntil = this.shortBlockedUntil
            }
        }

    }

    public getAutoplayBlockEnabled(){
        return this.autoPlayBlocker
    }

    public setAutoplayBlockEnabled(enab:boolean){
        this.autoPlayBlocker = enab
    }

    public getDoomscrollingBlockEnabled(){
        return this.doomScrollingProtection
    }
    public getDoomscrollingRate(){
        return this.doomScrollingRate
    }
    public setDoomscrollingBlock(isEnabled:boolean,dsRate:number){
        this.doomScrollingProtection = isEnabled
        this.doomScrollingRate = dsRate
    }
}