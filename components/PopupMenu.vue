<script lang="ts" setup>
import { ref,onBeforeMount } from 'vue';
//import { BlockList } from '@/classes/BlockList';
import { cleanDomainName, parseResultsBlockEntry } from '@/utils';
import { BlockEntry } from '@/classes/BlockEntry';
import { getBlockEntryList } from '@/storage_utils';


const isPopAppMounted = ref(false)

//const selectBlockList = ref<BlockList | null> (null);
//const blockLists = ref<BlockList[]>([]);

const blockEntryList = shallowRef<BlockEntry[]>([])
const showDomain = ref(false)

const curDomain = ref("---");
//const listResults = ref("");


onBeforeMount(async () => {
  /*let blockEntries = await browser.storage.local.get(["blockList"])
  getBlockEntryList()
  .then((results) => {
    console.log('[]?',results)
      return parseResultsBlockEntry(results.blockList);
  }).catch((err) =>{
    console.error('ERROR - PopupMenu.vue:',err)
    return []
  })

  blockEntries.map((blEntry) =>{
    blockEntryList.value.push(blEntry);
  })*/

  blockEntryList.value = await getBlockEntryList()
  
  
  //await handleBlockColor();

  //confuso, remontar
  do {
      await nextTick()
      isPopAppMounted.value = (blockEntryList.value !== null)

  } while (!isPopAppMounted.value)

});

async function redirectSettings() {
  const url = browser.runtime.getURL('/settings.html');
  await browser.tabs.create({ url });
}

async function getCurrentDomain(): Promise<string> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tabUrl: string | undefined = tabs[0]?.url;
      if (tabUrl) {
        return cleanDomainName(tabUrl);
      } else {
        console.error("URL indefinida");
        return "N/A";
      }
    }
    return "N/A";
  } catch (error) {
    console.error("Erro ao acessar domínio da aba:", error);
    return "N/A";
  }
}

async function logDomain(){
  if(showDomain.value){
    showDomain.value = false
  } else {
    const domain = await getCurrentDomain();
    
    curDomain.value = domain;
    showDomain.value = true
  }
}

const isBlockedDomain = () =>{
  for (let it in blockEntryList.value){
    if (Boolean(curDomain.value.indexOf(blockEntryList.value[it].getDomainName()) != -1)){
      return true
    }
  }
  return false
}
</script>



<template>

  <div class="card" v-if="isPopAppMounted">
    
    <div class="title-box">
      <img src="/wxt.svg" alt="OzoneBlock" id="card-logo">
      <p id="card-title">OzoneBlock</p>

    </div>

    
    <div class="domain-box">
      <div class="domain-box">
        <button class="menu-button" type="button" @click="logDomain" v-if="!showDomain">
           Mostrar domínio atual
           <i>&#x25C1;</i>
        </button>
        <button class="menu-button" type="button" @click="logDomain" v-else>
           Mostrar domínio atual
           <i>&#x25BD;</i>
        </button>
        <div class="code-box" :hidden="!showDomain">
          <code id="domain-code" >
            {{curDomain}}
          </code>
            <button id="add-domain-button" :disabled="isBlockedDomain()">
              <i v-if="!isBlockedDomain()">&#x1F7A7;</i>
              <i v-else>&#x00D8;</i>
              ADD
            </button>
        </div>
        <p v-if="isBlockedDomain()">*Este domínio já está registrado</p>
      </div>

      <div class="domain-box">
        <button id="config-button" type="button" @click="redirectSettings()"> Config</button>
      </div>
    </div>

    
  </div>
</template>

<!-- Passar para dentro do style.css-->

<style scoped>


.card{
  background-color: oklch(37.2% 0.044 257.287);
  color:whitesmoke;
}

.title-box{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  vertical-align: center;
  font-size: 2rem;
  padding: 0.8rem;
  border-radius: 0.2rem;
  border: solid  rgba(245, 245, 245, 0.6) 2px ;
}

.list-box{
  display: flex;
  flex-direction: column;
}

.domain-box{
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  border-radius: 0.2rem;
  border: solid  rgba(245, 245, 245, 0.6) 2px ;
}

.code-box{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  vertical-align: center;
  width: 100%;
  border-radius: 0.4rem;
  border: solid  rgba(245, 245, 245, 0.6) 2px ;
}

  code {
    background-color: #1a1a1a8e;
    transition: 160ms;
    border-radius: 0.2em;
  }

code:hover {
    background-color: #1a1a1a;
  }

 button {
  color: whitesmoke;
  background-color: oklch(55.4% 0.046 257.417);
  border-radius: 0.1rem;
  border-color: whitesmoke;
  border-width: 0.1rem;
  padding: 0.1rem;
 }

 button:hover{
  color: oklch(55.4% 0.046 257.417);
  background-color: whitesmoke;
  border-radius: 0.1rem;
  border-color: oklch(55.4% 0.046 257.417);
  border-width: 0.1rem;
 }
 
 button:disabled{
  background-color: #cccccccc;
  color: #8a8a8a;
  border-radius: 0.1rem;
  border-color: oklch(55.4% 0.046 257.417);
  border-width: 0.1rem;
  
 }
 i{
  margin-right: 0.2rem;
  margin-left: 0.2rem;
 }

 .menu-button{
  padding-left: 0.24rem;
  padding-right: 0.24rem;
 }

 #add-domain-button{
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: center;
  padding: 0.16rem;
  padding-left: 0.24rem;
  padding-right: 0.24rem;
  border-top-right-radius: 0.2rem;
  border-bottom-right-radius: 0.2rem;
 }

 #blocking-button{
  height: 2rem;
  width: 2rem;
  border-radius: 0.2rem;
  border-color: rgba(127,127,127,0.6);
 }

#domain-code{
  position: relative;
  width: 100%;
  font-size: 1rem;
  padding:0.16rem;
  margin: 0px;
  padding-left: auto;
  padding-right: auto;
  border-top-left-radius: 0.2rem;
  border-bottom-left-radius: 0.2rem;
}

#blocked-sites-box{
  display: flex;
  flex-direction: column;
  background-color: lightgrey;
  border-radius: 0.4rem;
}

#card-logo{
  height: 2.4rem;
  width: 2.4rem;
  margin-right: 0.6rem;
}

#config-button{
  padding: auto;
  margin: 0.2rem;
}

#card-title{
  padding: 0px;
  margin: 0px;
  font-size: 2.1rem;
}
</style>
