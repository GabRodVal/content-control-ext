<script lang="ts" setup>
import { nextTick, ref, onBeforeMount, shallowRef, vModelCheckbox } from 'vue';
import { BlockEntry } from '@/classes/BlockEntry';
import { BlockEntryImp } from '@/interfaces/BlockEntryImp';
import { BlockWeekDays } from '@/interfaces/BlockWeekDays';
import { parseResultsBlockEntry, formatHoursMinutes } from '@/utils';
import { getBlockEntryList, setBlockEntryList } from '@/storage_utils';

const blockEntryList = shallowRef<BlockEntry[]>([]);
const mounted = ref<boolean>(false)
const selectedBlockentry = ref(-1)

const blockWeekDays = ref<BlockWeekDays>({
    blockByWeekday: false,
    wDays: {
        sunBlock: false,
        monBlock: false,
        tueBlock: false,
        wedBlock: false,
        thuBlock: false,
        friBlock: false,
        satBlock: false
    }
});

const openBlockUntil = ref(false)
const openBlockHours = ref(false)
const openDailyLimit = ref(false)

const blockUntilHours = ref(0)
const blockUntilMinutes = ref(0)

const blockIntervalHours1 = ref(0);
const blockIntervalMinutes1 = ref(0);
const blockIntervalHours2 = ref(0);
const blockIntervalMinutes2 = ref(0);
const blockIntervalInconsistency = ref(false);

const dailyLimitHours = ref(0)
const dailyLimitMinutes = ref(0)

onBeforeMount(async () => {
  /*await browser.storage.local.get(["blockList"]).then((result)=>{
    blockEntryList.value = parseResultsBlockEntry(result.blockList);
  }).catch((err) => {
    console.error(err)
  })*/

    blockEntryList.value = await getBlockEntryList();

    await nextTick();

    mounted.value = true
});

async function updateBlockEntryList(){
    if (mounted){
        setBlockEntryList(blockEntryList.value)

        await nextTick();

        blockEntryList.value = await getBlockEntryList()
        console.log('SettingsBlockOptions: BlockEntryList => Updated!')
    } else {
        console.warn('SettingsBlockOptions: BlockEntryList =>Not Updated...', `mounted:${mounted} | typeof_match:${typeof(blockEntryList.value) === typeof(Array<BlockEntry>)}`)
    }
}

function addBlockUntil(blEntry: BlockEntry, blHr:number, blMn:number){
    const curTime = new Date()
    const blockTime = (blHr * 1000 * 60 * 60) + (blMn * 1000 * 60)
    curTime.setTime(curTime.getTime() + blockTime)
    blEntry.setBlockedUntil(curTime)

    updateBlockEntryList()
}

function clearDailyLimit(blEntry: BlockEntry){
    if(blEntry.getDailyLimit()){
        blEntry.toggleDailyLimit();
    }

    blEntry.setDailyLimitTime(1000 * 60 * 60 * 24);
    updateBlockEntryList()
    console.log(`${blEntry.getDomainName()} dailyLimit reseted`)
}

function setDailyLimit(blEntry: BlockEntry, blHr:number, blMn:number){
    if(!blEntry.getDailyLimit()){
        blEntry.toggleDailyLimit();
    }

    let newDailyTimeLimit = Math.min((blHr * 1000 * 60 * 60) + (blMn * 1000 * 60), 1000 * 60 * 60 * 24);
    blEntry.setDailyLimitTime(newDailyTimeLimit);

    updateBlockEntryList()
    console.log(`${blEntry.getDomainName()} dailyLimit set to ${(newDailyTimeLimit)/(1000*60*60)}h`)
}

function addBlockHoursInterval(blEntry: BlockEntry, blHr1:number, blMn1:number, blHr2:number, blMn2:number){
    if(((blHr1*100)+blMn1) >= ((blHr2*100)+blMn2)){
        console.warn('Intervalo inválido');
        blockIntervalInconsistency.value = true
    } else {
        const lowerInterval = new Date()
        const upperInterval = new Date()
        lowerInterval.setHours(blHr1, blMn1)
        upperInterval.setHours(blHr2, blMn2)

        if(lowerInterval === upperInterval){
            console.error('ERRO: Lower e Upper Interval são identicos!')
            return
        }

        blEntry.pushBlockHours(lowerInterval, upperInterval)
        updateBlockEntryList()
    }
}

function removeBlockHoursInterval(blEntry: BlockEntry, intervalIndex: number){
    const allIntervals = blEntry.getBlockHours()
    blEntry.removeBlockHours(allIntervals[intervalIndex])
    updateBlockEntryList()
}

function updateWeekDays(blEntry:BlockEntry, bWeek:BlockWeekDays){
    blEntry.setBlockWeekDays(bWeek);
    updateBlockEntryList();
}

</script>

<template>
    <div class="settings-content">
        <p>Opções de Bloqueio</p>
        <div class="settings-item" v-if="mounted">
            <label for="block-list-select">Bloqueio a Configurar:</label>
            <select v-model="selectedBlockentry" id="block-list-select">
            <option v-for="(blcEnt, index) in blockEntryList" :key="index" :value="index" v-on:change="()=>{
                selectedBlockentry = index
                blockWeekDays = blockEntryList[selectedBlockentry].getBlockWeekDays()
                }">
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
                    <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">Bloquear</button>

                    <input type="checkbox" v-model="openBlockUntil" name="bloqueio-ativo">
                        <label for="bloqueio-ativo">Realizar bloqueio</label>
                        <div v-if="openBlockUntil">
                            <!--Adicionar Leading Zeros-->
                            <input type="number" v-model="blockUntilHours" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                            <input type="number" v-model="blockUntilMinutes" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                            <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked" v-on:click="addBlockUntil(blockEntryList[selectedBlockentry], blockUntilHours, blockUntilMinutes)">
                                Ativar Bloqueio
                            </button>
                        </div>
                    
                </div>
                <div>
                    <p>Horários de bloqueio</p>
                    <code>
                        <code v-if="(blockEntryList[selectedBlockentry].getBlockHours().length < 1)">
                            N/A
                        </code>
                        <div v-else>
                            <code v-for="(blcHour, index) in blockEntryList[selectedBlockentry].getBlockHours()">
                                {{ `${blcHour[0]} - ${blcHour[1]}` }}
                                <button v-on:click="removeBlockHoursInterval(blockEntryList[selectedBlockentry], index)">
                                    x
                                </button>
                            </code>
                        </div>
                    </code>
                    
                    <input type="checkbox" v-model="openBlockHours" name="horarios-bloqueados">
                    <label for="horarios-bloqueados">Configurar intervalo de bloqueio predefinido</label>
                    <div v-if="openBlockHours">
                        <!--Adicionar Leading Zeros-->
                        <p>De</p>
                        <input type="number" v-model="blockIntervalHours1" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                        <input type="number" v-model="blockIntervalMinutes1" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                        <p>---</p>
                        <p>Até</p>
                        <input type="number" v-model="blockIntervalHours2" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                        <input type="number" v-model="blockIntervalMinutes2" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">

                        <p v-if="blockIntervalInconsistency">
                            *O começo do intervalo deve ser menor que o seu fim
                        </p>
                        <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked" v-on:click="addBlockHoursInterval(
                            blockEntryList[selectedBlockentry],
                            blockIntervalHours1,
                            blockIntervalMinutes1,
                            blockIntervalHours2,
                            blockIntervalMinutes2
                            )">
                            Adicionar Intervalo
                        </button>
                    </div>
                    <div>

                        <input type="checkbox" id="weekday-toggle" v-model="blockWeekDays.blockByWeekday">
                        <label for="weekday-toggle">{{blockWeekDays.blockByWeekday}}</label>

                        <div v-bind:hidden="!blockWeekDays.blockByWeekday || blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                            
                            <input type="checkbox" id="sun-block" v-model="blockWeekDays.wDays.sunBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry], blockWeekDays)"/>
                            <label for="sun-block">Domingo</label>
                            <input type="checkbox" id="mon-block" v-model="blockWeekDays.wDays.monBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry], blockWeekDays)"/>
                            <label for="mon-block">Segunda-feira</label>
                            <input type="checkbox" id="tue-block" v-model="blockWeekDays.wDays.tueBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry], blockWeekDays)"/>
                            <label for="tue-block">Terça-feira</label>
                            <input type="checkbox" id="wed-block" v-model="blockWeekDays.wDays.wedBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry], blockWeekDays)"/>
                            <label for="wed-block">Quarta-feira</label>
                            <input type="checkbox" id="thu-block" v-model="blockWeekDays.wDays.thuBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry], blockWeekDays)"/>
                            <label for="thu-block">Quinta-feira</label>
                            <input type="checkbox" id="fri-block" v-model="blockWeekDays.wDays.friBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry], blockWeekDays)"/>
                            <label for="fri-block">Sexta-feira</label>
                            <input type="checkbox" id="sat-block" v-model="blockWeekDays.wDays.satBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry], blockWeekDays)"/>
                            <label for="sat-block">Sábado</label>
                        </div>
                    
                    </div>
                </div>
                <div>
                    <p>Limite de uso diário</p>
                    <code>{{ blockEntryList[selectedBlockentry].getDailyLimit() }}</code>
                    <code v-if="blockEntryList[selectedBlockentry].getDailyLimit()">
                        {{formatHoursMinutes(blockEntryList[selectedBlockentry].getAccessTime().today)}}/{{formatHoursMinutes(blockEntryList[selectedBlockentry].getDailyLimitTime())}}
                    </code>
                    <div>
                        <input type="checkbox" v-model="openDailyLimit" name="limite-diario">
                        <label for="limite-diario">Configurar limite diário</label>
                        <div v-if="openDailyLimit">
                            <!--Adicionar Leading Zeros-->
                            <input type="number" v-model="dailyLimitHours" name="" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                            <input type="number" v-model="dailyLimitMinutes" id="" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked">
                            
                            <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked" v-on:click="clearDailyLimit(blockEntryList[selectedBlockentry])">
                                Limpar limite
                            </button>

                            <button v-bind:disabled="blockEntryList[selectedBlockentry].isBlocked().isBlocked" v-on:click="setDailyLimit(blockEntryList[selectedBlockentry], dailyLimitHours, dailyLimitMinutes)">
                                Definir limite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
</template>

<style scoped>

    

</style>