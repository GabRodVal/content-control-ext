<script lang="ts" setup>
import { ref,onBeforeMount } from 'vue';
//import { BlockList } from '@/classes/BlockList';
import { cleanDomainName, parseResultsBlockEntry } from '@/utils';
import { BlockEntry } from '@/classes/BlockEntry';

const isPopAppMounted = ref(false)

//const selectBlockList = ref<BlockList | null> (null);
//const blockLists = ref<BlockList[]>([]);

const blockEntryList = ref<BlockEntry[]>([])

const curDomain = ref("");
//const listResults = ref("");


onBeforeMount(async () => {
  let blockEntries = await browser.storage.local.get(["blockList"])
  .then((results) => {
    console.log('[]?',results)
      return parseResultsBlockEntry(results.blockList);
  }).catch((err) =>{
    console.error('ERROR - PopupMenu.vue:',err)
    return []
  })

  blockEntries.map((blEntry) =>{
    console.log('blEntry:',blEntry)
    blockEntryList.value.push(blEntry);
  })
  
  
  browser.storage.local.onChanged.addListener(handleBlockColor)

  //await handleBlockColor();

  //confuso, remontar
  do {

      isPopAppMounted.value = (blockEntryList.value !== null)

    if(!isPopAppMounted.value){
      setTimeout(() => {}, 2000)
      console.log('block', blockEntryList)
    }
  } while (!isPopAppMounted.value)

  handleBlockColor();
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
  const domain = await getCurrentDomain();
  curDomain.value = domain;
}

async function toggleBlock(){

  let block = await browser.storage.local.get(["currentlyBlocking"]);

  /*const blockButton = document.getElementById("blocking-button");
  //Aplicar classes no style.css | Adicionar Style.css padrão em 'content.ts' | aplicar
  if (blockButton != null){
    if (block.currentlyBlocking){
      blockButton.style.backgroundColor = "#cf0000";
    } else {
      blockButton.style.backgroundColor = "limegreen";
    }
  }*/

  browser.storage.local.set({currentlyBlocking: !block.currentlyBlocking}, () => {});
}

async function handleBlockColor(){
  const block = await browser.storage.local.get(["currentlyBlocking"]);

  const blockButton = document.getElementById("blocking-button");
  if (blockButton != null){
    if (!block.currentlyBlocking){
      blockButton.style.backgroundColor = "#cf0000";
    } else {
      blockButton.style.backgroundColor = "limegreen";
    }
  }
}
</script>

<template>
  <div class="card" v-if="isPopAppMounted">

    <button id="blocking-button" type="button" @click="toggleBlock">BLOCK</button>

    <div class="list-box">
        <p>Sites Bloqueados:</p>
        <div id="blocked-sites-box">
          <code v-for="(site, index) in blockEntryList" :key="index" :value="site">
            {{ site.getDomainName() }}
          </code>
      </div>
  </div>
    
    <!--<div>
      <p>{{ listResults }}</p>
    </div>-->
    

    <div class="domain-box">
      <button class="menu-button" type="button" @click="logDomain"> Mostrar domínio atual</button>
      <code id="domain-code" v-if="curDomain !== ''">{{curDomain}}</code>
    </div>

    <button id="config-button" type="button" @click="redirectSettings()"> Config</button>
  </div>
</template>

<!-- Passar para dentro do style.css-->

<style scoped>
.list-box{
  display: flex;
  flex-direction: column;
}

.domain-box{
  display: flex;
  flex-direction: column;
  background-color: lightgrey;
  border-radius: 0.4rem;
}

.menu-button{
  color:whitesmoke;
  background-color: limegreen;

}

#config-button{
  color: whitesmoke;
  background-color: teal;
  margin: 0.2em
}

#blocking-button{
  color: whitesmoke;
}

#domain-code{
  position: relative;
  height: 2rem;
  font-size: 1rem;
  margin-top: auto;
}

#blocked-sites-box{
  display: flex;
  flex-direction: column;
  background-color: lightgrey;
  border-radius: 0.4rem;
}
</style>
