<script lang="ts" setup>
import { ref,onBeforeMount } from 'vue';
//import { BlockList } from '@/classes/BlockList';
import { cleanDomainName, formatHoursMinutes, parseResultsBlockEntry } from '@/utils';
import { BlockEntry } from '@/classes/BlockEntry';
import { getBlockEntryList, setBlockEntryList } from '@/storage_utils';


const isPopAppMounted = ref(false)

//const selectBlockList = ref<BlockList | null> (null);
//const blockLists = ref<BlockList[]>([]);

const blockEntryList = shallowRef<BlockEntry[]>([])
const blockId = ref(-1)
const showDomain = ref(false)

const curDomain = ref("---");
const addThrough = ref(false)
//const listResults = ref("");


onBeforeMount(async () => {

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

async function addBlockEntryToList(domName:string){
    var newEntry = new BlockEntry(domName)
    blockEntryList.value.push(newEntry)

    if (isPopAppMounted){
        setBlockEntryList(blockEntryList.value)

        await nextTick();
        let blPromise:Array<BlockEntry> =  await getBlockEntryList()
        await nextTick();

        blockEntryList.value = blPromise

        console.log('PopUp: BlockEntryList => Updated!')
        addThrough.value = true
    } else {
        console.warn('PopUp: BlockEntryList =>Not Updated...')
    }
}


async function getCurrentDomain(): Promise<string> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tabUrl = tabs[0]?.url;
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


const handleToggleShowDomain = async() =>{
  showDomain.value = !showDomain.value
  curDomain.value = await getCurrentDomain();
}

const isBlockedDomain = () =>{

  for (let it = 0; it < blockEntryList.value.length; it++){
    if (Boolean(curDomain.value.indexOf(blockEntryList.value[it]?.getDomainName()!) != -1)){
      blockId.value = it
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
        <button class="menu-button" type="button" @click="handleToggleShowDomain" v-if="!showDomain">
           Mostrar domínio atual
           <i>&#x25C1;</i>
        </button>
        <button class="menu-button" type="button" @click="handleToggleShowDomain" v-else>
           Mostrar domínio atual
           <i>&#x25BD;</i>
        </button>
        
        <div class="code-box" v-if="showDomain" >
          <code id="domain-code">
            {{curDomain}}
          </code>
            <button id="add-domain-button" :disabled="isBlockedDomain() || addThrough" v-on:click="addBlockEntryToList(curDomain)">
              <i v-if="!isBlockedDomain()">&#x1F7A7;</i>
              <i v-else>&#x00D8;</i>
              ADD
            </button>
        </div>
      </div>

      <div class="domain-box">
        <div>
          <p class="domain-info">Domínio Registrado: {{blockId!=-1 ? 'Verdadeiro' : 'Falso'}}</p>
            <div v-if="isBlockedDomain()" class="domain-box">
            <p class="domain-info">Limite Diário:
              <code v-if="blockEntryList[blockId]?.getDailyLimit()">{{formatHoursMinutes(blockEntryList[blockId]?.getAccessTime().today!)}}/{{formatHoursMinutes(blockEntryList[blockId]?.getDailyLimitTime()!)}}</code>
              <code v-else>N/A</code>
            </p>

            <p class="domain-info">Dias de Bloqueio:</p>
            <code v-if="!blockEntryList[blockId]?.getBlockWeekDays().blockByWeekday">
              N/A
            </code>
            <div v-else class="info-box">
              <code class="wk-code" v-if="blockEntryList[blockId]?.getBlockWeekDays().wDays.sunBlock">Domingo</code>
              <code class="wk-code" v-if="blockEntryList[blockId]?.getBlockWeekDays().wDays.monBlock">Segunda-feira</code>
              <code class="wk-code" v-if="blockEntryList[blockId]?.getBlockWeekDays().wDays.tueBlock">
                Terça-feira</code>
              <code class="wk-code" v-if="blockEntryList[blockId]?.getBlockWeekDays().wDays.wedBlock">
                Quarta-feira</code>
              <code class="wk-code" v-if="blockEntryList[blockId]?.getBlockWeekDays().wDays.thuBlock">
                Quinta-feira</code>
              <code class="wk-code" v-if="blockEntryList[blockId]?.getBlockWeekDays().wDays.friBlock">
                Sexta-feira</code>
              <code class="wk-code" v-if="blockEntryList[blockId]?.getBlockWeekDays().wDays.satBlock">
                Sábado</code>

            </div>

            <p class="domain-info">Horários de Bloqueio:</p>
            <code v-if="(blockEntryList[blockId]?.getBlockHours().length??0)<1">
              N/A
            </code>
            <div v-else class="info-box">
              <code class="wk-code" v-for="blHour in blockEntryList[blockId]?.getBlockHours()">
                {{blHour}}
              </code>
            </div>
          </div>
        </div>
        
      </div>

      <div class="domain-box">
        <button id="config-button" type="button" @click="redirectSettings()">⚙ Configurações</button>
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
  padding: 0.64rem;
  padding-top: 0.24rem;
  padding-bottom: 0.24rem;
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
  padding: 0.44rem;
  margin-bottom: 0.24rem;
  margin-top: 0.24rem;
  border-radius: 0.24rem;
  border: solid  rgba(245, 245, 245, 0.6) 2px;
}

.info-box{
  display:flex;
  flex-wrap: wrap;
  max-width: 280px;
  align-items: center;
  justify-content: center;
  vertical-align: center;
  padding: 0.36rem;
  border-radius: 0.4rem;
  border: solid  rgba(245, 245, 245, 0.6) 2px ;
}

.domain-info{
  padding: 0.2rem;
  margin: 0.2rem;
  font-size: 0.88rem;
}

.wk-code{
  border-radius: 0.4rem;
  margin: 0.16rem;
  margin-left: 0.24rem;
  margin-right: 0.24rem;
  padding: 0.24rem;
  font-size: 0.64rem;
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
