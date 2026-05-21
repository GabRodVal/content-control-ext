import { BlockList } from "@/interfaces/BlockList";

export default defineBackground(() => {

  function createBlockList(name: string, blockedSites: Array<string>): BlockList{
    return {
      name,
      blockedSites,
      isActive: true,
      blockedUntil: new Date(0),
      blockIntervals: [],
      accessDay: new Date(),
      accessTime: 0,
    }
  }

  //Garantir q a lista não seja substituida ao atualizar a extensão ou o navegador.
  let currentlyBlocking = true;
  let blockLists = [createBlockList("Lista Padrao", ["youtube.com", "x.com", "tiktok.com"])];

  browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({
      currentlyBlocking: currentlyBlocking,
      blockLists: blockLists
    }, () => {});
    console.log('On Install: OK')
  })

  browser.storage.local.get([
    "currentlyBlocking",
    "blockLists"
  ], (result) =>{
    currentlyBlocking = result.currentlyBlocking;
    blockLists = result.blockLists;
  });
  console.log('Get #1: OK')

  //Block logic
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

  //Mudar para storage.local
  browser.storage.onChanged.addListener((changes, namespace) =>{
    if (namespace == 'local'){
      if(changes.currentlyBlocking) {
        currentlyBlocking = changes.currentlyBlocking.newValue;
      }
      if(changes.blockLists){
        blockLists = changes.blockLists.newValue;
      }

      browser.storage.local.getBytesInUse(['currentlyBlocking', 'blockLists'], (result) => {
        console.log(`Cur Storage Use: ${result} bytes`)
      })
      browser.storage.local.get(null).then((result: object) =>{
        console.log(`Cur Keys: ${Object.keys(result)};`)
      }).catch((err: string) => console.error(`Error: ${err}`));
    }
  })

});