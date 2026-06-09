import { BlockList } from "@/classes/BlockList";
import { BlockEntry } from "@/classes/BlockEntry";
import { clearAllIntervals, parseResultsBlockEntry } from "@/utils";
import { setBlockEntryList } from "@/storage_utils";

export default defineBackground(() => {

  const initBlockEntries: Array<BlockEntry> = []
  var blockList: Array<BlockEntry> = []
  const usageIntervals: Array<NodeJS.Timeout> = []

  initBlockEntries.push(new BlockEntry('youtube.com'))
  initBlockEntries.push(new BlockEntry('instagram.com'))
  initBlockEntries[1].addAccessTime(1000 * 60 * 60 * 4)
  initBlockEntries.push(new BlockEntry('x.com'))
  initBlockEntries[2].addAccessTime(1000 * 60 * 60 * 8)
  initBlockEntries.push(new BlockEntry('chat.openai.com'))
  initBlockEntries.push(new BlockEntry('tiktok.com'))
  initBlockEntries[4].addAccessTime(1000 * 60 * 60 * 3)
  initBlockEntries.push(new BlockEntry('reddit.com'))


  //Garantir q a lista não seja substituida ao atualizar a extensão ou o navegador.
  let currentlyBlocking = true;
  //let blockLists = [createBlockList("Lista Padrao", ["youtube.com", "x.com", "tiktok.com"])];

  browser.runtime.onInstalled.addListener(async () => {
    browser.storage.local.set({
      currentlyBlocking: currentlyBlocking,
      //blockLists: blockLists,
      blockList: initBlockEntries,
    }, () => {});
    console.log('On Install: OK')

    await nextTick()
    console.log('Instalando...')

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

  /*setInterval(() => {
    for (var f = 0; f < blockList.length; f++){
      blockList[f].updateAccessTime();
    }
  },20 * 60 * 1000)
  */

  if (blockList.length < 1){
    console.log('Iniciando...')

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
  
  var usageBeholders:NodeJS.Timeout[] = []
  var accumulatedTime: number = 0
  var lastBlDomain = '';
  const usageEvents = [
    browser.windows.onFocusChanged,
    browser.tabs.onUpdated,
    browser.tabs.onActivated,
  ]

  usageEvents.forEach(ev => {
    ev.addListener(async () => {

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    if (tabs.length > 0) {

      const tabUrl: string | undefined = tabs[0]?.url;
      if (tabUrl!== undefined) {

        var curDomain = new URL(tabUrl).hostname;
        if(curDomain !== lastBlDomain){
          if (usageBeholders.length > 0) {
            usageBeholders = clearAllIntervals(usageBeholders)
          }

          blockList.map((blockedDomain, index) => {
            let bDomainName = blockedDomain.getDomainName();


            let theOne = Boolean(curDomain.indexOf(bDomainName) != -1);
            console.log('the one:', bDomainName, theOne)

            if (theOne) {
              usageBeholders = clearAllIntervals(usageBeholders)
              var lastInterval = new Date();
              usageBeholders.push(setInterval(() => {
                var newInterval = new Date();
                var timeAdded = newInterval.getTime() - lastInterval.getTime();
                blockList[index].addAccessTime(timeAdded);
                accumulatedTime += timeAdded;
                console.log(`${bDomainName}: +2.5s! (${timeAdded})| ${blockList[index].getAccessTime().today}`)

                if (accumulatedTime > 1000 * 60 * 1) {
                  setBlockEntryList(blockList);
                  console.log(blockList)

                  accumulatedTime = 0;
                  console.log('Time accumulated')
                }
                lastInterval = newInterval;
              }, 2500)
              );
            }
          })

          lastBlDomain = curDomain;
        }
        
      }
    }
  })})

  /*browser.windows.onFocusChanged.addListener(async () => {
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
              blockedDomain.addAccessTime(1000);
              accumulatedTime += 1000;
              console.log(`${bDomainName}: +1s!`)

              if (accumulatedTime > 1000 * 60 * 2) {
                browser.storage.local.set({
                  blockList: blockList,
                }, () => { });
                accumulatedTime = 0;
                console.log('Time accumulated')
              }
            }, 1000);
          }
        })
      }
    }
  })*/

  /*browser.tabs.onUpdated.addListener(async () => {
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
              blockedDomain.addAccessTime(3000);
              accumulatedTime += 3000;
              console.log(`${bDomainName}: +3s!`)

              if (accumulatedTime > 3000 * 60 * 3) {
                browser.storage.local.set({
                  blockList: blockList,
                }, () => { });
                accumulatedTime = 0;
                console.log('Time accumulated')
              }
            }, 3000);
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
              blockedDomain.addAccessTime(3000);
              accumulatedTime += 3000;
              console.log(`${bDomainName}: +3s!`)


              if (accumulatedTime > 1000 * 60 * 3) {
                browser.storage.local.set({
                  blockList: blockList,
                }, () => { });
                accumulatedTime = 0;
                console.log('Time accumulated')
              }
            }, 3000);
          }

          return theOne;

        })
      } 
    }

  })
*/
});