<script lang="ts" setup>
import { nextTick, ref, onBeforeMount, h } from 'vue';
import { BlockEntry } from '@/classes/BlockEntry';

import { formatHoursMinutes, parseResultsBlockEntry } from '@/utils';
import { setBlockEntryList,  getBlockEntryList } from '@/storage_utils';
import type { BlockEntryImp } from '@/interfaces/BlockEntryImp';

//const checked = true
//const isExtensionEnabled = ref(true)
//const isBlockingEnabled = ref(true)
//const isRegisteringEnabled = ref(true)
//const isCosmeticFilteringEnabled = ref(true)
//const isDoomScrollingProtectionEnabled = ref(true)

//const blockLists = ref<BlockList[]>([]);
const blockList = shallowRef<BlockEntry[]>([]);


const mounted = ref<boolean>(false)

const domainToAdd = ref('')
const regDom =  new RegExp(/^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/)



const blockRecs: Array<string> = [
    'instagram.com',
    'facebook.com',
    'x.com',
    'chatgpt.com',
    'youtube.com',
    'tiktok.com',
    'claude.ai',
    'whatsapp.com',
    'twitch.tv',
    'reddit.com',
    'pinterest.com',
    'tumblr.com',
    'discord.com',
    'shopee.com.br',
    'kwai.com',

]

function findRepetition(domName:string){
    for (var it in blockList.value){
        let blLst = blockList.value[it]
        if (blLst){
            if (blLst.getDomainName().includes(domName) ||
            domName.includes(blLst.getDomainName())){
                return true
            }
        }
    }
    return false
}

const handleDomainName = (domName:string) =>{
    if (domName === '') {
        return false
    }
    
    let rep = findRepetition(domName)

    let domField = document.getElementById('domainField')

    

    if (!regDom.test(domName) || rep){
        if (domField != null){
            domField.style.color = '#DD8866'
            domField.style.border = 'solid #DD4433 2px'
            return true
        }
    } else {
        if (domField != null){
            domField.style.color = 'whitesmoke'
            domField.style.border = 'solid whitesmoke 2px'
            return false
        }
    }
} 

async function addBlockEntryToList(domName:string){
    var newEntry = new BlockEntry(domName)
    blockList.value.push(newEntry)

    if (mounted){
        setBlockEntryList(blockList.value)

        await nextTick();

        let blPromise:Array<BlockEntry> =  await getBlockEntryList()
        await nextTick();
        blockList.value = blPromise
        console.log('SettingsBlockOptions: BlockEntryList => Updated!')
    } else {
        console.warn('SettingsBlockOptions: BlockEntryList =>Not Updated...', `mounted:${mounted} | typeof_match:${typeof(blockList.value) === typeof(Array<BlockEntry>)}`)
    }
}

async function removeBlockEntry(index:number){
    blockList.value.splice(index,1)

    if (mounted){
        setBlockEntryList(blockList.value)

        await nextTick();

        let blPromise:Array<BlockEntry> =  await getBlockEntryList()
        await nextTick();
        blockList.value = blPromise
        console.log('SettingsBlockOptions: BlockEntryList => Updated!')
    } else {
        console.warn('SettingsBlockOptions: BlockEntryList =>Not Updated...', `mounted:${mounted} | typeof_match:${typeof(blockList.value) === typeof(Array<BlockEntry>)}`)
    }
}

onBeforeMount(async () => {
    console.log('1')
  await browser.storage.local.get(["blockList"]).then((result)=>{
    blockList.value = parseResultsBlockEntry(result.blockList as BlockEntryImp[]);
}).catch((err) => {
    console.error(err)
  }).finally(() =>{
    console.log(mounted.value)
  });

    await nextTick();

    mounted.value = true
    console.log(mounted.value)
});

</script>

<template>
    <div class="settings-content">
        <p>Páginas Registradas</p>
        <div class="settings-item" >
            <div class="domain-table-container">
                <table class="domain-table">
                    <thead class="domain-table-head">
                        <tr>
                            <th>Domínio</th>
                            <th>Adicionado Em</th>
                            <th>Disponível</th>
                            <th>Bloqueio Curto</th>
                            <th>T. Acesso (Dia)</th>
                            <th>T. Acesso (Total)</th>
                            <th>Excluir Item </th>
                        </tr>
                    </thead>
                    <tbody v-if="mounted" class="domain-table-body">
                        <tr v-for="domain,idx in blockList" class="domain-table-row"> 
                            <td class="domain-table-cell"> {{ domain.getDomainName() }} </td>
                            <td class="domain-table-cell"> {{ domain.getLastAccess().toLocaleString()}} </td>
                            <td class="domain-table-cell"> {{ domain.isBlocked().isBlocked ? 'Bloqueado':'Livre' }}</td>
                            <td class="domain-table-cell"> {{ domain.getShortBlock().shortBlock ? 'Habilitado' : 'Desabilitado' }}</td>
                            <!--<td class="domain-table-cell"> {{`${(domain.getAccessTime().total)}|${formatHoursMinutes(domain.getAccessTime().total)}`}} </td>-->
                            <td class="domain-table-cell"> {{`${formatHoursMinutes(domain.getAccessTime().today)}`}} </td>
                            <td class="domain-table-cell"> {{`${formatHoursMinutes(domain.getAccessTime().total)}`}} </td>
                            <td class="domain-table-cell"> <button class="rmvlist-button" :disabled="domain.isBlocked().isBlocked" v-on:click="removeBlockEntry(idx)">REMOVER</button> </td>
                        </tr>
                        <!--{{/renderBlockList(blockLists[0])}}-->
                    </tbody>
                </table>
            </div>
            <div class="domain-table-operators">
                <div class="addlist-box">
                    <input type="text" id="domainField" placeholder="novo.site" v-model="domainToAdd" v-on:input="handleDomainName(domainToAdd)">
                    <button class="addlist-button" id="addlist-domain-button" v-on:click="addBlockEntryToList(domainToAdd)" :disabled="handleDomainName(domainToAdd)"> Adicionar </button>
                </div>
            </div>
        </div>
        
        <div class="settings-item">
            <p>Recomendações de Bloqueio</p>
            <div class="rec-box">
                <span v-for="vbr in blockRecs">
                    <code class="addlist-code" :style="{ 'display': findRepetition(vbr) ? 'none' : 'flex'}">
                        {{vbr}}
                        <button class="addlist-button" v-on:click="addBlockEntryToList(vbr)">
                            Adicionar
                        </button>
                    </code>
                </span>
            </div>
        </div>
    </div>
</template>