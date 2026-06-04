<script lang="ts" setup>
import { nextTick, ref, onBeforeMount, h } from 'vue';
import { BlockEntry } from '@/classes/BlockEntry';
import { parseResultsBlockEntry } from '@/utils';

//const checked = true
//const isExtensionEnabled = ref(true)
//const isBlockingEnabled = ref(true)
//const isRegisteringEnabled = ref(true)
//const isCosmeticFilteringEnabled = ref(true)
//const isDoomScrollingProtectionEnabled = ref(true)

//const blockLists = ref<BlockList[]>([]);
const blockEntryList = ref<BlockEntry[]>([]);
const mounted = ref<boolean>(false)
const selectedBlockentry = ref(-1)

const openBlockUntil = ref(false)
const openBlockHours = ref(false)
const openDailyLimit = ref(false)

onBeforeMount(async () => {
    console.log('1')
  await browser.storage.local.get(["blockList"]).then((result)=>{
    blockEntryList.value = parseResultsBlockEntry(result.blockList);
  }).catch((err) => {
    console.error(err)
  })

    await nextTick();

    mounted.value = true
});

</script>

<template>
    <div class="settings-content">
        <p>Opções de Bloqueio</p>
        <div class="settings-item" v-if="mounted">
            <label for="block-list-select">Lista de Bloqueio Atual</label>
            <select v-model="selectedBlockentry" id="block-list-select">
            <option v-for="(blcEnt, index) in blockEntryList" :key="index" :value="index" v-on:change="()=>{selectedBlockentry = index}">
                {{ `${blcEnt.getDomainName()}` }}
            </option>
            </select>

            <div v-if="(selectedBlockentry != -1)">
                <div>
                    <p>Estado</p>
                    <code>Bloqueado: {{ blockEntryList[selectedBlockentry].isBlocked() }}</code>
                </div>
                <div>
                    <p>Bloqueio ativo até</p>
                    <code v-if="blockEntryList[selectedBlockentry].getBlockedUntil() < (new Date())"> --- </code>
                    <code v-else>{{ blockEntryList[selectedBlockentry].getBlockedUntil() }}</code>
                    <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">Bloquear</button>

                    <input type="checkbox" v-model="openBlockUntil" name="bloqueio-ativo">
                        <label for="bloqueio-ativo">Realizar bloqueio</label>
                        <div v-if="openBlockUntil">
                            <!--Adicionar Leading Zeros-->
                            <input type="number" name="" id="" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">
                            <input type="number" name="" id="" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">
                            <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">Ativar Bloqueio</button>
                        </div>
                    
                </div>
                <div>
                    <p>Horários de bloqueio</p>
                    <code>
                        <code v-if="(blockEntryList[selectedBlockentry].getBlockHours().length < 1)">
                            N/A
                        </code>
                        <div v-else>
                            <code v-for="blcHour in blockEntryList[selectedBlockentry].getBlockHours()">
                                {{ `${blcHour[0]} - ${blcHour[1]}` }}
                                <button>x</button>
                            </code>
                        </div>
                    </code>
                    
                    <input type="checkbox" v-model="openBlockHours" name="horarios-bloqueados">
                    <label for="horarios-bloqueados">Configurar intervalo de bloqueio predefinido</label>
                    <div v-if="openBlockHours">
                        <!--Adicionar Leading Zeros-->
                        <p>De</p>
                        <input type="number" name="" id="" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">
                        <input type="number" name="" id="" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">
                        <p>---</p>
                        <p>Até</p>
                        <input type="number" name="" id="" max="23" min="{{() => {return 2}}}" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">
                        <input type="number" name="" id="" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">

                        <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">Adicionar Intervalo</button>
                    </div>
                    <button>toggle dias da semana</button>
                    <code>CONSERTAR 'WEEKDAYS'</code>
                </div>
                <div>
                    <p>Limite de uso diário</p>
                    <code>{{ blockEntryList[selectedBlockentry].getDailyLimit() }}</code>
                    <code v-if="blockEntryList[selectedBlockentry].getDailyLimit()">
                        {{`${Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60 * 60))}h${Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60)) - (Math.floor(blockEntryList[selectedBlockentry].getDailyLimitTime()/(1000 * 60 * 60)) * 60)}m`}}
                    </code>
                    <div>
                        <input type="checkbox" v-model="openDailyLimit" name="limite-diario">
                        <label for="limite-diario">Configurar limite diário</label>
                        <div v-if="openDailyLimit">
                            <!--Adicionar Leading Zeros-->
                            <input type="number" name="" id="" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">
                            <input type="number" name="" id="" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">
                            <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">Limpar limite</button>
                            <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked()">Alterar limite</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
</template>

<style scoped>

    

</style>