export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({
      currentlyBlocking: true,
      defaultBlockList: "youtube.com"
    }, () => {});
  })



  let currentlyBlocking = true;
  let defaultBlockList = "youtube.com";

  browser.storage.local.get([
    "currentlyBlocking",
    "defaultBlockList"
  ], (result) =>{
    currentlyBlocking = result.currentlyBlocking;
    defaultBlockList= result.defaultBlockList;
  });

  browser.webRequest.onBeforeRequest.addListener(
    (details)=> {
      if(!currentlyBlocking){
        return {cancel: false};
      }

      let cancel = defaultBlockList.split(/\n/)
      .some(site => {
        let url = new URL(details.url);
        return Boolean(url.hostname.indexOf(site) != -1);
      });

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
      if(changes.defaultBlockList){
        defaultBlockList = changes.defaultBlockList.newValue;
      }
    }
  })

});