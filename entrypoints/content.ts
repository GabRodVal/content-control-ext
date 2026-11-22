import { CosmeticFilter } from "@/classes/CosmeticFilter";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  async main() {
    console.log('Hello content.');
    //let bPage = browser.extension.getBackgroundPage();
    
    var filterList: Array<string> = []
    //const cFilter:CosmeticFilter = bPage.cosmeticFilterList

    //browser.storage.local.get(['filterList'], (result) =>{
    //    filterList = result.filterList
    //})

    onMounted(async () => {
      /*await browser.storage.local.get(["blockList"]).then((result)=>{
        blockEntryList.value = parseResultsBlockEntry(result.blockList);
      }).catch((err) => {
        console.error(err)
      })*/

    });

    await browser.storage.local.get(["filterList"]).then((result) => {
      filterList = result.filterList
    }).catch((err) => {
      console.error(err)
    });

    await nextTick()

    const cFilter = new CosmeticFilter(filterList, '1')


    //window.location.href
    let curUrlSt = document.URL 
    //let curTab = await browser.tabs.getCurrent()
    await nextTick()

    setTimeout(()=>{},1050)
    //const curTab = browser.tabs.query({ active: true, lastFocusedWindow: true })
    
    //if (typeof(curTab) !== undefined && typeof(curTab?.url) !== undefined) {
    //  let curUrl = new URL(curTab.url)
    if (typeof(curUrlSt) !== undefined){
      let curUrl = new URL(curUrlSt)
      console.log('URL in')
      var fList = cFilter.getFilterList()
      for (var it in fList){
        //console.log(`${fList[it]}:${curUrl}`)
        var fResponse = cFilter.parseFilter(fList[it], curUrl)
        if (fList[it].includes(curUrl.hostname)){
          console.log(fList[it])
          console.log(fResponse)
        }  
        
        if (fResponse.toBlock) {
          if (fResponse.blockType == 'elem-hide'){
            switch(fResponse.blockSubtype){
              case 'id':
                if (fResponse.blockContent !== null) {
                  let elmt = document.getElementById(fResponse.blockContent)
                    if (elmt !== null && elmt?.parentNode !== null) {
                      elmt.parentNode.removeChild(elmt)
                      console.log(`ID remove ${fResponse.blockContent}`)
                    }
                }
              case 'class':
                if (fResponse.blockContent !== null) {
                  let els = document.getElementsByClassName(fResponse.blockContent)
                  for (var el = 0; el < els.length; el++) {
                    let elIt = els.item(el)
                    if (elIt !== null && elIt?.parentNode !== null) {
                      elIt.parentNode.removeChild(elIt)
                      console.log(`CLASS remove ${fResponse.blockContent}`)
                    }
                  }
                }
              case 'element':
                if (fResponse.blockContent !== null){
                  let els = document.getElementsByTagName(fResponse.blockContent)
                  for (var el = 0; el < els.length; el++ ){
                    let elIt = els.item(el)
                    if (elIt !== null && elIt?.parentNode !== null){
                      elIt.parentNode.removeChild(elIt)
                      console.log(`ELMNT remove ${fResponse.blockContent}`)
                    }
                  }
                }
            }
          }
        }
      }
    }


    
  },
});
