import { BlockList } from "@/interfaces/BlockList";

export default defineBackground(() => {

function createBlockList(name: string, blockedSites: Array<string>): BlockList{
  return{
    name,
    blockedSites,
    isActive: true,
    blockedUntil: new Date(0),
    blockIntervals: [],
    accessDay: new Date(),
    accessTime: 0,
  }
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

  let currentlyBlocking = true;
  let blockLists = [createBlockList("Lista Padrao", ["youtube.com", "x.com", "tiktok.com"])];

  browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({
      currentlyBlocking: currentlyBlocking,
      blockLists: blockLists
    }, () => {});
  })

  browser.storage.local.get([
    "currentlyBlocking",
    "blockLists"
  ], (result) =>{
    currentlyBlocking = result.currentlyBlocking;
    blockLists = result.blockLists;
  });

  browser.webRequest.onBeforeRequest.addListener(
    (details)=> {
      if(!currentlyBlocking){
        return {cancel: false};
      }

      let cancel = blockLists.some(blockList =>{
        const siteList = blockList.blockedSites;

        let cancel = siteList.some(site => {
          let url = new URL(details.url);
          return Boolean(url.hostname.indexOf(site) != -1);
        });

        return cancel;
      })
      return {cancel:cancel};
    },
    {
      urls: ["<all_urls>"]
    },
    [
      "blocking"
    ]
  );

  browser.storage.onChanged.addListener((changes, namespace) =>{
    if (namespace == 'local'){
      if(changes.currentlyBlocking) {
        currentlyBlocking = changes.currentlyBlocking.newValue;
      }
      if(changes.blockLists){
        blockLists = changes.blockLists.newValue;
      }
    }
  })

});