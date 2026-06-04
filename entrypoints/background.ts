import { BlockList } from "@/classes/BlockList";
import { BlockEntry } from "@/classes/BlockEntry";
import { parseResultsBlockEntry } from "@/utils";

export default defineBackground(() => {

  /*function createBlockList(name: string, blockedSites: Array<string>): BlockList{
    return {
      name,
      blockedSites,
      isActive: true,
      blockedUntil: new Date(0),
      blockIntervals: [],
      accessDay: new Date(),
      accessTime: 0,
    }
  }*/

  const initBlockEntries: Array<BlockEntry> = []
  var blockList: Array<BlockEntry> = []


  initBlockEntries.push(new BlockEntry('youtube.com'))
  initBlockEntries.push(new BlockEntry('instagram.com'))
  initBlockEntries.push(new BlockEntry('x.com'))
  initBlockEntries.push(new BlockEntry('chat.openai.com'))
  initBlockEntries.push(new BlockEntry('tiktok.com'))


  //Garantir q a lista não seja substituida ao atualizar a extensão ou o navegador.
  let currentlyBlocking = true;
  //let blockLists = [createBlockList("Lista Padrao", ["youtube.com", "x.com", "tiktok.com"])];

  browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({
      currentlyBlocking: currentlyBlocking,
      //blockLists: blockLists,
      blockList: initBlockEntries,
    }, () => {});
    console.log('On Install: OK')

    setTimeout(() => {
      console.log('Instalando...')
    }, 1000)

    browser.storage.local.get([
      "currentlyBlocking",
      //"blockLists",
      "blockList",
    ], (result) => {
      currentlyBlocking = result.currentlyBlocking;
      //blockLists = result.blockLists;
      blockList = parseResultsBlockEntry(result.blockList);

      console.log('Get #1a: OK =>', blockList, typeof (blockList[0]))
    });
  })

  setInterval(() => {
    for (var f = 0; f < blockList.length; f++){
      blockList[f].updateAccessTime();
    }
  },10 * 60 * 1000)


  if (blockList.length < 1){
    setTimeout(() => {
      console.log('Iniciando...')
    }, 5000)

    browser.storage.local.get(["blockList"],
      (result) => {
        blockList = parseResultsBlockEntry(result.blockList);
        console.log('Get #1b: OK =>', blockList, typeof(blockList))
    });
  }


  //Block logic
  browser.webRequest.onBeforeRequest.addListener(
    (details)=> {
      if(!currentlyBlocking){
        return {cancel: false};
      }

      /*let cancel = blockLists.some(blockList =>{
        const siteList = blockList.blockedSites;

        let cancel = siteList.some(site => {
          let url = new URL(details.url);
          return Boolean(url.hostname.indexOf(site) != -1);
        });

        return cancel;
      })*/


      let cancel = blockList.some((blockedDomain:BlockEntry) => {
        let bDomainName = blockedDomain.getDomainName();
        let curDomain = new URL(details.url);
        let cancel = false;

        let theOne = Boolean(curDomain.hostname.indexOf(bDomainName) != -1);

        if (theOne) {
          cancel = blockedDomain.isBlocked();
        }

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
      //if(changes.blockLists){
      //  blockLists = changes.blockLists.newValue;
      //}
      if(changes.blockList){
        blockList = parseResultsBlockEntry(changes.blockList.newValue);
      }

      //Debug
      browser.storage.local.getBytesInUse(['currentlyBlocking', 'blockList'], (result) => {
        console.log(`Cur Storage Use: ${result} bytes`)
      })
      browser.storage.local.get(null).then((result: object) =>{
        console.log(`Cur Keys: ${Object.keys(result)};`)
      }).catch((err: string) => console.error(`Error: ${err}`));
    }
  })
  
  var usageBeholder:NodeJS.Timeout
  var accumulatedTime: number = 0

  browser.windows.onFocusChanged.addListener(async () => {
    if (usageBeholder !== null) {
      clearInterval(usageBeholder);
    }

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tabUrl: string | undefined = tabs[0]?.url;
      if (tabUrl) {
        blockList.map(blockedDomain => {
          let bDomainName = blockedDomain.getDomainName();
          let curDomain = new URL(tabUrl);

          let theOne = Boolean(curDomain.hostname.indexOf(bDomainName) != -1);

          if (theOne) {
            if (usageBeholder !== null) {
              clearInterval(usageBeholder);
            }
            usageBeholder = setInterval(() => {
              blockedDomain.addAccessTime(2500);
              accumulatedTime += 2500;
              console.log(`${bDomainName}: +2.5s!`)

              if (accumulatedTime > 1000 * 60 * 2) {
                browser.storage.local.set({
                  blockList: blockList,
                }, () => { });
                accumulatedTime = 0;
                console.log('Time accumulated')
              }
            }, 2500);
          }
        })
      }
    }
  })

  browser.tabs.onUpdated.addListener(async () => {
    if (usageBeholder !== null) {
      clearInterval(usageBeholder);
    }

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tabUrl: string | undefined = tabs[0]?.url;
      if (tabUrl) {
        blockList.map(blockedDomain => {
          let bDomainName = blockedDomain.getDomainName();
          let curDomain = new URL(tabUrl);

          let theOne = Boolean(curDomain.hostname.indexOf(bDomainName) != -1);

          if (theOne) {
            if (usageBeholder !== null) {
              clearInterval(usageBeholder);
            }
            usageBeholder = setInterval(() => {
              blockedDomain.addAccessTime(2500);
              accumulatedTime += 2500;
              console.log(`${bDomainName}: +2.5s!`)

              if (accumulatedTime > 1000 * 60 * 2) {
                browser.storage.local.set({
                  blockList: blockList,
                }, () => { });
                accumulatedTime = 0;
                console.log('Time accumulated')
              }
            }, 2500);
          }
        })
      } 
    }
  })
    //browser.windows.onFocusChanged.addListener((windowId) => {
  browser.tabs.onActivated.addListener(async (actInfo) => {
    console.log(`Aba N#${actInfo.tabId}: Em atividade`);
    console.log(`Janela N#${actInfo.windowId}: Em atividade`);
    
    if(usageBeholder !== null){
      clearInterval(usageBeholder);
    }

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tabUrl: string | undefined = tabs[0]?.url;
      if (tabUrl) {
        let match = blockList.some(blockedDomain => {
          let bDomainName = blockedDomain.getDomainName();
          let curDomain = new URL(tabUrl);

          let theOne = Boolean(curDomain.hostname.indexOf(bDomainName) != -1);

          if (theOne) {
            if (usageBeholder !== null) {
              clearInterval(usageBeholder);
            }
            usageBeholder = setInterval(() => {
              blockedDomain.addAccessTime(2500);
              accumulatedTime += 2500;
              console.log(`${bDomainName}: +2.5s!`)


              if (accumulatedTime > 1000 * 60 * 2) {
                browser.storage.local.set({
                  blockList: blockList,
                }, () => { });
                accumulatedTime = 0;
                console.log('Time accumulated')
              }
            }, 2500);
          }


          return theOne;

        })
      } 
    }

  })

});