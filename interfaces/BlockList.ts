export interface BlockList {
    name: string;
    blockedSites: Array<string>;
    isActive: boolean;
    blockedUntil: Date;
    blockIntervals: Array<[string, string]>;
    accessDay: Date;
    accessTime: Number;
  }

/*class BlockList {
name: string;
blockedSites: Array<string>;
isActive: boolean = true;
blockedUntil: Date = new Date(0);
blockIntervals: Array<[string, string]> = []; 

constructor(name:string, blockedSites: Array<string>){
  this.name = name;
  this.blockedSites = blockedSites;
}

getName(){
  return this.name;
}

getBlockedSites(){
  return this.blockedSites;
}

addBlockedSite(site:string){
  if(!this.blockedSites.includes(site)){
    this.blockedSites.push(site);
  }
}
removeBlockedSite(site:string){
  if(this.blockedSites.includes(site)){
    const removeIndex = this.blockedSites.indexOf(site);
    this.blockedSites.splice(removeIndex, 1);
  }
}

getIsActive(){
  return this.isActive;
}
setIsActive(isActive: boolean){
  this.isActive = isActive;
}

getBlockedUntil(){
  return this.blockedUntil;
}

updateBlockedUntil(hours:number, minutes:number){
  const curDate = new Date();
  if (curDate > this.blockedUntil){
    curDate.setHours(curDate.getHours() + hours);
    curDate.setMinutes(curDate.getMinutes() + minutes);

    this.blockedUntil = curDate;
  } else {
    this.blockedUntil.setHours(curDate.getHours() + hours);
    this.blockedUntil.setMinutes(curDate.getMinutes() + minutes);
  }
}

addBlockInterval(intervalStart:string, intervalEnd:string){
  const hourMinReg = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
  if(hourMinReg.test(intervalStart) && hourMinReg.test(intervalEnd)){
    this.blockIntervals.push([intervalStart, intervalEnd]);
  }
}

removeBlockInterval(removeIndex:number){
  this.blockIntervals.splice(removeIndex, 1)
}
}
*/