<script lang="ts" setup>
import { BlockEntry } from '@/classes/BlockEntry';
import { getBlockEntryList, getBlockType } from '@/storage_utils';
import { formatHoursMinutes, verifyBlockType } from '@/utils';
import { ref, onMounted } from 'vue';

const blockPurpDict: Record<string, string> = {
  '000':'Nenhuma razão de bloqueio, algo está errado',
  '001':'Bloqueio Ativo',
  '010':'Dentro do Intervalo de Bloqueio',
  '011':'Limite de Tempo atingido',
  '100':'Atraso de Acesso. Se isto está sendo visto, algo está errado',
  '101':'Proteção Contra Ciclos Viciosos.',
  '110':'Uma das listas de filtragem utilizadas classifica o domínio como malicioso.',
  '111':'Outro',
  'NAN':'ERRO: Parâmetro inválido.',
}

const blockPurpose = ref('')
const blockDom: Ref<URL> = ref(new URL('https://a.co'))
const blockedEntry: Ref<BlockEntry|undefined> = ref(undefined)

onBeforeMount(async () => {
  //const blockPurp = await getBlockType();
  const blockList = await getBlockEntryList();
  

  let curTab = await browser.tabs.getCurrent()
  await nextTick()

  if (curTab?.url !== undefined){
    let curUrl = new URL(curTab.url)
    let curPageParams = curUrl.searchParams
    console.log('TTT')
    console.log(curPageParams)
    console.log(curPageParams.get("bltype"))
    console.log(curPageParams.get("ogdom"))
    blockPurpose.value = curPageParams.get("bltype")||''
    let tDom = 'https://'.concat(curPageParams.get("ogdom")||'')
    if (tDom !== null){
      blockDom.value = new URL(tDom)
    }
    
  }

  blockedEntry.value = blockList.find((bl, ind) =>  Boolean(blockDom.value.hostname.indexOf(bl.getDomainName()) != -1))
});

function specBlockType(blType: string|null): string{
  if (blType === null){
    return ''
  }
  let blKey:string = verifyBlockType(blockPurpose.value)
  return blockPurpDict[blKey]
}

</script>

<template>

  <div class="block-bg">
    <div class="block-container">
      <p class="block-title">PÁGINA BLOQUEADA</p>
      <p class="block-subtitle"> Bloqueio - OzoneBlock</p>
      <div class="block-purp-container">

        <p class="block-end-text" v-if="verifyBlockType(blockPurpose)==='001'">
          Bloqueado até: <span>{{ blockedEntry?.getBlockedUntil() }}</span>
        </p>
        <div>
          <p>
            A página 
            <span>{{blockDom}}</span>
              está bloqueada devido a configuração: 
            <span>[{{specBlockType(blockPurpose)}}]</span>
          </p>
        </div>
      </div>
      <p> Você utilizou <span>{{ blockDom.hostname }}</span> por <span>{{ formatHoursMinutes(blockedEntry?.getAccessTime().today||0) }}</span> hoje</p>
    </div>
  </div>

</template>
