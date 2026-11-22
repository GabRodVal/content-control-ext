import { BlockEntryAccessTime } from "@/interfaces/BlockEntryAccessTime";
import { BlockObject } from "@/interfaces/BlockObject";
import { BlockWeekDays } from "@/interfaces/BlockWeekDays";

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
        }){
        //Resolver formatação
        this.domainName = domainName;
        this.blockedUntil =  blockedUntil;//new Date(2000, 1, 1);
        this.blockHours = blockHours;//[];
        this.blockWeekDays = blockWeekdays;//[];
        this.dailyLimit = dailyLimit;//false;
        this.dailyLimitTime = dailyLimitTime//24 * 60 * 60 * 1000;
        this.lastAccess = lastAccess;// new Date();
        this.accessTime = accessTime/*{
            total: 0,
            today: 0,
            curWeek: 0,
            lastWeek: 0,
            curMonth: 0,
            lastMonth: 0,
            lastUpdate: new Date()
        };*/
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
            intA = intervals[f][0].split(`:`)
            intB = intervals[f][1].split(`:`)

            hourA.setHours(parseInt(intA[0]), parseInt(intA[1])); 
            hourB.setHours(parseInt(intB[0]), parseInt(intB[1])); 

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
        this.blockWeekDays = wkDays
    }

    /*
    public pushBlockWeekDays(blDay: string){
        let curBlDays = this.blockWeekDays

        //["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        let lowBlDay = blDay.toLowerCase()
        if (lowBlDay === 'sunday' ||
            lowBlDay === 'monday' ||
            lowBlDay === 'tuesday'||
            lowBlDay === 'wednesday'||
            lowBlDay === 'thursday' ||
            lowBlDay === 'friday' ||
            lowBlDay === 'saturday') {
                if (curBlDays.findIndex((el, id) => {
                    if (el.toLowerCase() === lowBlDay) return true;
                    return false
                }
                ) === -1) {
                    curBlDays.push(lowBlDay)
                    this.blockWeekDays = curBlDays
                } else {
                    console.warn(`AVISO: Dia da semana repetido: ${blDay}`)
                }
            } else {
                console.warn(`AVISO: Dia da semana inválido: ${blDay}`)
            }

    }

    public removeBlockWeekDays(blDay: string) {
        let oldBlDays = this.blockWeekDays

        let newBlDays = oldBlDays.filter((el, id) => el !== blDay.toLowerCase());

        this.blockWeekDays = newBlDays
    }
    */
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
        const msDay = 24 * 60 * 60 * 1000;

        let oldAccessTime = this.accessTime
        let currently = new Date();

        if (oldAccessTime.lastUpdate.getDate() != currently.getDate()) {
            oldAccessTime.today = 0
            if (Math.abs(currently.getDate() - oldAccessTime.lastUpdate.getDate()) >= 7 ||
                oldAccessTime.lastUpdate.getDay() > currently.getDay()) {
                oldAccessTime.lastWeek = oldAccessTime.curWeek;
                oldAccessTime.curWeek = 0;
            }
        }

        if (oldAccessTime.lastUpdate.getFullYear() == currently.getFullYear()){
            if (oldAccessTime.lastUpdate.getMonth() == currently.getMonth()){
            } else {
                oldAccessTime.today = 0
                oldAccessTime.lastMonth = oldAccessTime.curMonth;
                oldAccessTime.curMonth = 0;
            }
        } else {
            oldAccessTime.today = 0
            oldAccessTime.lastMonth = oldAccessTime.curMonth;
            oldAccessTime.curMonth = 0;
        }

        /*
        let lastUpUTC = Date.UTC(oldAccessTime.lastUpdate.getFullYear(), oldAccessTime.lastUpdate.getMonth(), oldAccessTime.lastUpdate.getDate());
        let curUTC = Date.UTC(currently.getFullYear(), currently.getMonth(), currently.getDate());


        if (Math.floor((curUTC - lastUpUTC) / msDay) >= 1 || currently.getDay() !== oldAccessTime.lastUpdate.getDay()) {
            oldAccessTime.today = 0;
        }

        if(Math.floor((curUTC - lastUpUTC)/msDay) >= 7 + (currently.getDay() - oldAccessTime.lastUpdate.getDay())){
            oldAccessTime.lastWeek = oldAccessTime.curWeek;
        }

        if (Math.floor((curUTC - lastUpUTC)/msDay) >= 30 + (currently.getDate() - oldAccessTime.lastUpdate.getDate()) || currently.getMonth() !== oldAccessTime.lastUpdate.getMonth()) {
            oldAccessTime.lastMonth = oldAccessTime.curMonth;
            oldAccessTime.curMonth = 0;
        }
        */

        oldAccessTime.lastUpdate = currently;

        this.accessTime = oldAccessTime;
    }

    public addAccessTime(milisec:number){
        this.updateAccessTime();
        this.updateLastAccess();

        this.accessTime.today    += milisec
        this.accessTime.curWeek  += milisec
        this.accessTime.curMonth += milisec

        this.accessTime.total    += milisec
    }

    public isBlocked(): BlockObject{
        let currently = new Date();
        let curAccessTime = this.getAccessTime()

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
                    return { isBlocked: true, blockType: 'blockHour' }
                }
            } else {
                return { isBlocked: true, blockType: 'blockHour' }
            }
            
            //let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            /*if (this.getBlockWeekDays().some((el) => {
                if (weekdays[currently.getDay()].toLowerCase() === el.toLowerCase()) {
                    return { isBlocked: true, blockType: 'blockHour' }
                }

                return { isBlocked: false, blockType: 'none' }

            }))
            {
                
            }*/
        }

        if (curAccessTime.today >= this.getDailyLimitTime()){
            return { isBlocked: true, blockType: 'timeUp' }
        }

        return { isBlocked: false, blockType: 'none' }
    }

}