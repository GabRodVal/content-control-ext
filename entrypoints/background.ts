import { BlockEntry } from "@/classes/BlockEntry";
import { CosmeticFilter } from "@/classes/CosmeticFilter";
import { clearAllIntervals, parseResultsBlockEntry} from "@/utils";
import { getBlockConfig, setBlockConfig, setBlockEntryList } from "@/storage_utils";

export default defineBackground(() => {

  const initBlockEntries: Array<BlockEntry> = []
  var blockList: Array<BlockEntry> = []
  var blockType: string = 'none'
  const usageIntervals: Array<NodeJS.Timeout> = []
  //rever
  const cosmeticFilterList = new CosmeticFilter([],'0')
  const filterList: Array<String> = []
  const filterVersion: string = '0'

  //////////////////////////////////////////////////////
  /*initBlockEntries.push(new BlockEntry('youtube.com'))
  initBlockEntries.push(new BlockEntry('instagram.com'))
  initBlockEntries[1].addAccessTime(1000 * 60 * 60 * 4)
  initBlockEntries.push(new BlockEntry('x.com'))
  initBlockEntries[2].addAccessTime(1000 * 60 * 60 * 8)
  initBlockEntries.push(new BlockEntry('chat.openai.com'))
  initBlockEntries.push(new BlockEntry('tiktok.com'))
  initBlockEntries[4].addAccessTime(1000 * 60 * 60 * 3)
  initBlockEntries.push(new BlockEntry('reddit.com'))*/
  /////////////////////////////////////////////////////

  //Garantir q a lista não seja substituida ao atualizar a extensão ou o navegador.
  var currentlyBlocking = true;
  var statsRegEnabled = true;
  //let blockLists = [createBlockList("Lista Padrao", ["youtube.com", "x.com", "tiktok.com"])];

  //Ao instalar
  browser.runtime.onInstalled.addListener(async () => {
    browser.storage.local.set({
      currentlyBlocking: currentlyBlocking,
      filterEnabled: true,
      statsRegEnabled: true,
      //filterList: filterList,
      //filterVersion: filterVersion,
      //blockLists: blockLists,
      blockList: initBlockEntries,
      blockType: blockType,
    }, () => {});

    console.log('On Install: OK')

    await nextTick()

    await cosmeticFilterList.forceUpdateFilter()

    await nextTick()

    browser.storage.local.set({
      filterList: cosmeticFilterList.getFilterList(),
      filterVersion: cosmeticFilterList.getFilterVersion(),
    }, () => { });

    await nextTick()
    console.log('Instalando...')

    browser.storage.local.get([
      "currentlyBlocking",
      //"blockLists",
      "blockList",
      "statsRegEnabled"
    ], (result:any) => {
      currentlyBlocking = result.currentlyBlocking;
      //blockLists = result.blockLists;
      blockList = parseResultsBlockEntry(result.blockList);
      statsRegEnabled = result.statsRegEnabled;

      console.log('Get #1a: OK =>', blockList, typeof (blockList[0]))
    });
  })

  //Sem condicional, atualiza tempo de acesso
  setInterval(() => {
    for (var f = 0; f < blockList.length; f++){
      if (!statsRegEnabled) {
        break
      }
      if (blockList !== undefined){
        blockList[f]?.updateAccessTime();
      }
    }
    setBlockConfig(blockList, blockType)
  },5 * 60 * 1000)


  //Não corre durante a instalação
  //Executa se blocklist estiver vazia
  if (blockList.length < 1){
    console.log('Iniciando...')

    browser.storage.local.get(["blockList"],
      (result:any) => {
        blockList = parseResultsBlockEntry(result.blockList);
        console.log('Get #1b: OK =>', blockList, typeof(blockList))
    });
  }


  //Block logic
  //Currently blocks anything in the blocklist
  browser.webRequest.onBeforeRequest.addListener(
    (details:any) => {
      if(!currentlyBlocking){
        return {cancel: false};
      }
      

      let cancel = blockList.some((blockedDomain:BlockEntry) => {

        let bDomainName = blockedDomain.getDomainName();
        let curDomain = new URL(details.url);
        let cancel = false;

        let theOne = Boolean(curDomain.hostname.indexOf(bDomainName) != -1);

        if (theOne) {
          let blockRes = blockedDomain.isBlocked()
          blockType = blockRes.blockType;
          cancel = blockRes.isBlocked;


          if (cancel === true && !details.thirdParty){
            console.log('DETAILS')
            console.log(details)
            setTimeout(()=>{},500)
            let blUrl = new URL(browser.runtime.getURL('/blockPage.html'))
            blUrl.search = `?ogdom=${curDomain.hostname}&bltype=${blockType}`
            browser.tabs.update(details.tabId, {url: blUrl.href})
          }
        }

        return cancel;
      })
      return {cancel:cancel};
    },
    {
      urls: ["<all_urls>"]
    },
    [
      "blocking",
      "requestBody"
    ]
  );

  browser.webNavigation.onCommitted.addListener(
    async (details:any) => {
      //console.log('Nav Committed')
      //console.log(details)
      let navUrl = new URL(details.url)
      let oUrl: URL


      if (
        details.transitionType == 'auto_subframe' ||
        details.transitionQualifiers.includes('client_redirect')
      ) {

        browser.tabs.get(details.tabId, async (res:any) => {
          let tUrl = res.url
          if (tUrl != undefined) {
            oUrl = new URL(tUrl)


            blockList.some((blockedDomain: BlockEntry) => {

              let bDomainName = blockedDomain.getDomainName();

              let theOne = Boolean(oUrl.hostname.indexOf(bDomainName) != -1);

              if (theOne) {
                blockedDomain.blockByAutoplay()
              }
            }
            ) 
          }
        })

        }
  }
  )

  //////////////////////////////////////////////////////////window.
  

  //Mudar para storage.local
  browser.storage.onChanged.addListener((changes:any, namespace:string) =>{
    if (namespace == 'local'){
      if(changes.currentlyBlocking) {
        currentlyBlocking = changes.currentlyBlocking.newValue;
      }
 
      if(changes.blockList){
        blockList = parseResultsBlockEntry(changes.blockList.newValue);
      }

      //Debug
      browser.storage.local.getBytesInUse(['currentlyBlocking', 'blockList'], (result:any) => {
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

  function validateUrl(nUrl:string){
    try {
      let wUrl = new URL(nUrl)
      return wUrl   
    } catch (error) {
      return null
    }
  }
  usageEvents.forEach(ev => {
    ev.addListener(async () => {

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    if (tabs.length > 0 && tabs[0]) {

      if (tabs[0].url !== undefined){
        const tabUrl: string = tabs[0].url;
      
        if (tabUrl !== undefined) {

          var tabCmpUrl = validateUrl(tabUrl)
          if (tabCmpUrl !== null){
            var curDomain = tabCmpUrl.hostname;
            if(curDomain !== lastBlDomain){
              if (usageBeholders.length > 0) {
                usageBeholders = clearAllIntervals(usageBeholders)
              }

              blockList.map((blockedDomain, index) => {
                if (!statsRegEnabled){
                  return
                }
                let bDomainName = blockedDomain.getDomainName();


                let theOne = Boolean(curDomain.indexOf(bDomainName) != -1);

                if (theOne) {
                  usageBeholders = clearAllIntervals(usageBeholders)
                  var lastInterval = new Date();
                  usageBeholders.push(setInterval(() => {
                    var newInterval = new Date();
                    var timeAdded = newInterval.getTime() - lastInterval.getTime();
                    blockList[index]?.addAccessTime(timeAdded);

                    accumulatedTime += timeAdded;
                    console.log(`${bDomainName}: +2.5s! (${timeAdded})| ${blockList[index]?.getAccessTime().today} | sB ${blockList[index]?.getShortBlock().shortBlock}`)

                    if (accumulatedTime > 1000 * 60 * 1) {
                      setBlockEntryList(blockList);

                      accumulatedTime = 0;
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
      }
    }
  })})
});