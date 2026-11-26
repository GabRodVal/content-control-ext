import { BlockEntry } from "@/classes/BlockEntry";
import { CosmeticFilter } from "@/classes/CosmeticFilter";
import { getBlockEntryList, setBlockEntryList } from "@/storage_utils";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  async main(ctx) {

    async function handleFilter(flt:string, url:URL){
      
      var fResponse = cFilter.parseFilter(flt, url)

      if (!fResponse.toBlock) {
        return
      }

      if (fResponse.toBlock) {
        if (fResponse.blockType == 'elem-hide') {

          switch (fResponse.blockSubtype) {
            case 'id':
              if (fResponse.blockContent !== null) {
                let elmt = document.getElementById(fResponse.blockContent)
                if (elmt !== null && elmt?.parentNode !== null) {
                  await nextTick()
                  elmt.parentNode.removeChild(elmt)
                  console.log(`ID remove ${fResponse.blockContent}`)
                }
              }
            case 'class':
              if (fResponse.blockContent !== null) {
                let els = document.getElementsByClassName(fResponse.blockContent)
                if (els.length == 0) {
                  return
                }
                for (var el = 0; el < els.length; el++) {
                  let elIt = els.item(el)
                  if (elIt !== null && elIt?.parentNode !== null) {
                    await nextTick()
                    elIt.parentNode.removeChild(elIt)
                    console.log(`CLASS remove ${fResponse.blockContent}`)
                  }
                }
              }
            case 'element':
              if (fResponse.blockContent !== null) {
                let els = document.getElementsByTagName(fResponse.blockContent)
                if (els.length == 0) {
                  return
                }
                for (var el = 0; el < els.length; el++) {
                  let elIt = els.item(el)
                  if (elIt !== null && elIt?.parentNode !== null) {
                    await nextTick()
                    elIt.parentNode.removeChild(elIt)
                    console.log(`ELMNT remove ${fResponse.blockContent}`)
                  }
                }
              }
          }
        }
      }
    }

    function yielder(){
      return new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    }


    var filterList: Array<string> = []
    var filterEnabled: boolean
    await browser.storage.local.get([
      "filterList",
      "filterEnabled"
    ]).then((result) => {
      filterList = result.filterList
      filterEnabled= result.filterEnabled
    }).catch((err) => {
      console.error(err)
    });


    var blockList: Array<BlockEntry> = await getBlockEntryList()
    await nextTick()

    const cFilter = new CosmeticFilter(filterList, '1')
    
    
    const contentRoutine = async (event:Event) => {
      //window.location.href
      let curUrlSt = document.URL
      await nextTick()


      if (typeof (curUrlSt) !== undefined) {

        let curUrl = new URL(curUrlSt)
        blockList.some((blockedEntry: BlockEntry) => {
          let bDom = blockedEntry.getDomainName()

          if (Boolean(curUrl.hostname.indexOf(bDom) != -1)) {
            console.log(`CHECK!!!! ${curUrl.hostname} - ${bDom} - DOOM ${blockedEntry.getDoomscrollingBlockEnabled()}`)

            if (blockedEntry.getDoomscrollingBlockEnabled()) {
              const pageResizeObs = new ResizeObserver(entries => {
                blockedEntry.checkDoomscrolling(window.innerHeight, entries[0].target.scrollHeight)
                if(blockedEntry.isShortBlocked()){
                   setBlockEntryList(blockList)
                }
                }
              )
              setTimeout(() => { }, 550)
              pageResizeObs.observe(document.getElementsByTagName('body')[0], { box: 'device-pixel-content-box' })
              //document.body.onchange(
            }

          }

        })
        if (filterEnabled){
        var fList = cFilter.getFilterList()

        while (fList.length>=1){
          if (fList != undefined) {
            let fSt = fList.pop()
            if (fSt != undefined) {
              await handleFilter(fSt, curUrl)
            }
          }
          await yielder();
        }
      }


        /*for (var it in fList) {
          //console.log(`${fList[it]}:${curUrl}`)
          var fResponse = cFilter.parseFilter(fList[it], curUrl)

          if (!fResponse.toBlock) {
            continue
          }

          
        }
      }*/
        //mountend
      }
    }
    //})
  

    ctx.addEventListener(document, 'readystatechange', contentRoutine)

    await nextTick()

    ctx.addEventListener(window, "wxt:locationchange", contentRoutine);


    /*setTimeout(()=>{},40*1000)
    await nextTick()

    setInterval(async ()=>{
    if (typeof(curUrlSt) !== undefined){
      let curUrl = new URL(curUrlSt)

      for (var it in fListFinal){
        var fResponse = cFilter.parseFilter(fList[it], curUrl)
        
        if (fResponse.toBlock) {
          if (fResponse.blockType == 'elem-hide'){
            switch(fResponse.blockSubtype){
              case 'id':
                if (fResponse.blockContent !== null) {
                  let elmt = document.getElementById(fResponse.blockContent)

                    if (elmt !== null && elmt?.parentNode !== null) {
                      elmt.parentNode.removeChild(elmt)
                      await nextTick()
                      console.log(`ID remove ${fResponse.blockContent}`)
                    }
                }
              case 'class':
                if (fResponse.blockContent !== null) {
                  let els = document.getElementsByClassName(fResponse.blockContent)
                  if (els.length == 0) {
                    continue
                  }
                  for (var el = 0; el < els.length; el++) {
                    let elIt = els.item(el)
                    if (elIt !== null && elIt?.parentNode !== null) {
                      elIt.parentNode.removeChild(elIt)
                      await nextTick()
                      console.log(`CLASS remove ${fResponse.blockContent}`)
                    }
                  }
                }
              case 'element':
                if (fResponse.blockContent !== null){
                  let els = document.getElementsByTagName(fResponse.blockContent)
                  if (els.length == 0) {
                    continue
                  }
                  for (var el = 0; el < els.length; el++ ){
                    let elIt = els.item(el)
                    if (elIt !== null && elIt?.parentNode !== null){
                      elIt.parentNode.removeChild(elIt)
                      await nextTick()
                      console.log(`ELMNT remove ${fResponse.blockContent}`)
                    }
                  }
                }
            }
          }
        }
      }
    }

    },1000*50)*/

    
  },
});
