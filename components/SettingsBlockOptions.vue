<script lang="ts" setup>
import { nextTick, ref, onBeforeMount, shallowRef, vModelCheckbox } from 'vue';
import { BlockEntry } from '@/classes/BlockEntry';
import type { BlockEntryImp } from '@/interfaces/BlockEntryImp';
import type { BlockWeekDays } from '@/interfaces/BlockWeekDays';
import { parseResultsBlockEntry, formatHoursMinutes } from '@/utils';
import { getBlockEntryList, setBlockEntryList } from '@/storage_utils';

const blockEntryList = shallowRef<BlockEntry[]>([]);
const mounted = ref<boolean>(false)
const selectedBlockentry = ref(-1)

const blockWeekDays = shallowRef<BlockWeekDays>({
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

const openBlockUntil = ref<boolean>(false)
const openBlockHours = ref<boolean>(false)
const openDailyLimit = ref<boolean>(false)
const openShortBlock = ref<boolean>(false)

const autoplayBlockEnabled = ref<boolean>(false)
const doomscrollingBlockEnabled = ref<boolean>(false)

const doomscrollingBlockRate = ref(4000.0)

const blockUntilHours = ref(0)
const blockUntilMinutes = ref(0)

const blockIntervalHours1 = ref(0);
const blockIntervalMinutes1 = ref(0);
const blockIntervalHours2 = ref(0);
const blockIntervalMinutes2 = ref(0);
const blockIntervalInconsistency = ref(false);

const dailyLimitHours = ref(0)
const dailyLimitMinutes = ref(0)

const shortBlockLimit = ref(60 * 60 * 1000)
const shortBlockDuration = ref(5 * 60 * 1000)

onBeforeMount(async () => {

    blockEntryList.value = await getBlockEntryList();
    

    await nextTick();

    mounted.value = true
});

async function updateBlockEntryList(){
    if (mounted){
        setBlockEntryList(blockEntryList.value)

        await nextTick();

        let blPromise:Array<BlockEntry> =  await getBlockEntryList()
        await nextTick();
        blockEntryList.value = blPromise
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

async function addBlockHoursInterval(blEntry: BlockEntry, blHr1:number, blMn1:number, blHr2:number, blMn2:number){
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
        //
        
        await updateBlockEntryList()

        await updateWeekDays(blEntry, blockWeekDays.value)
    }
}

function removeBlockHoursInterval(blEntry: BlockEntry, intervalIndex: number){
    const allIntervals = blEntry.getBlockHours()
    if (allIntervals && allIntervals[intervalIndex]){
        blEntry.removeBlockHours(allIntervals[intervalIndex])
    }
    updateBlockEntryList()
}

async function updateWeekDays(blEntry:BlockEntry, bWeek:BlockWeekDays){
    await nextTick()
    blEntry.setBlockWeekDays(bWeek);
    await updateBlockEntryList();
}

async function updateShortBlock(blEntry:BlockEntry){
    await nextTick()
    console.log({
        enabled:openShortBlock.value,
        bInterval:shortBlockDuration.value,
        bLimit:shortBlockLimit.value
    })
    blEntry.setShortBlock(openShortBlock.value)
    blEntry.setShortBlockDuration(shortBlockDuration.value)
    blEntry.setShortBlockLimit(shortBlockLimit.value)

    await nextTick()

    console.log(blEntry.getShortBlock())
    
    updateBlockEntryList();
    console.log(`POS,`)
    console.log(blEntry.getShortBlock())
}

async function updateAutoplay(blEntry:BlockEntry) {
    await nextTick()
    blEntry.setAutoplayBlockEnabled(autoplayBlockEnabled.value)
    updateBlockEntryList();
}

async function updateDoomscrolling(blEntry:BlockEntry){
    await nextTick()
    blEntry.setDoomscrollingBlock(doomscrollingBlockEnabled.value, doomscrollingBlockRate.value)
    updateBlockEntryList();
}

const fRender = ref(true)
const forceUpdate = async(ind:number) => {

    await nextTick()
    let blEntry = blockEntryList.value[selectedBlockentry.value]
    if (blEntry){
        blockWeekDays.value = blEntry.getBlockWeekDays()

        openShortBlock.value = blEntry.getShortBlock().shortBlock
        openBlockHours.value = blEntry.getBlockHours().length > 0

        shortBlockDuration.value = blEntry.getShortBlock().shortBlockDur
        shortBlockLimit.value = blEntry.getShortBlock().shortBlockLimit

        autoplayBlockEnabled.value = blEntry.getAutoplayBlockEnabled()
        doomscrollingBlockEnabled.value = blEntry.getDoomscrollingBlockEnabled()
        doomscrollingBlockRate.value = blEntry.getDoomscrollingRate()
    }
    await nextTick()

}

</script>

<template>
    <div class="settings-content" v-if="fRender">
        <p>Opções de Bloqueio</p>
        <div class="settings-item" v-if="mounted">
            <label for="block-list-select">Bloqueio a Configurar:</label>
            <select v-model="selectedBlockentry" id="block-list-select">
            <option v-for="(blcEnt, index) in blockEntryList" :key="index" :value="index" v-on:click="async ()=>{
                await nextTick()
                selectedBlockentry = index
                console.log(`FRENDER`)
                fRender = false
                await forceUpdate(selectedBlockentry)
                console.log('updated')

                fRender = true
                //vm.$forceUpdate()
                }">
                {{ `${blcEnt.getDomainName()}` }}
            </option>
            </select>

            <div v-if="(selectedBlockentry != -1)">
                <div class="settings-option-box">
                    <p class="option-title">Estado</p>
                    <code>Bloqueado: {{ blockEntryList[selectedBlockentry]?.isBlocked().isBlocked ? 'BLOQUEADO':'LIVRE' }}</code>
                </div>

                <div class="settings-option-box">
                    <p class="option-title">Bloqueio ativo até</p>
                    <code v-if="(blockEntryList[selectedBlockentry]?.getBlockedUntil() ?? new Date(0)) < new Date()"> --- </code>
                    <code v-else>{{ blockEntryList[selectedBlockentry]?.getBlockedUntil() }}</code>

                    <div>
                        <input type="checkbox" v-model="openBlockUntil" name="bloqueio-ativo">
                        <label for="bloqueio-ativo">Realizar bloqueio</label>
                    </div>
                        <div v-if="openBlockUntil">
                            <!--Adicionar Leading Zeros-->
                            <input type="number" class="option-numberinput" v-model.number="blockUntilHours" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">
                            <span>:</span>
                            <input type="number" class="option-numberinput" v-model.number="blockUntilMinutes" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">
                            
                            <button class="settings-options-button" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked" v-on:click="addBlockUntil(blockEntryList[selectedBlockentry]!, blockUntilHours, blockUntilMinutes)">
                                Ativar Bloqueio
                            </button>
                        </div>
                    
                </div>

                <div class="settings-option-box">
                    <p class="option-title">Horários de bloqueio</p>
                    <div class="hourblock-box">
                        <code v-if="((blockEntryList[selectedBlockentry]?.getBlockHours().length ?? 0) < 1)">
                            N/A
                        </code>
                        <div v-else>
                            <code class="option-hourblock" v-for="(blcHour, index) in blockEntryList[selectedBlockentry]?.getBlockHours()">
                                {{ `${blcHour[0]} - ${blcHour[1]}` }}
                                <button class="addlist-button" v-on:click="removeBlockHoursInterval(blockEntryList[selectedBlockentry]!, index)">
                                    x
                                </button>
                            </code>
                        </div>
                    </div>
                    
                    <div>
                        <input type="checkbox" v-model="openBlockHours" name="horarios-bloqueados">
                        <label for="horarios-bloqueados">Configurar intervalo de bloqueio predefinido</label>
                    </div>
                    <div v-if="openBlockHours">
                        <!--Adicionar Leading Zeros-->
                        <p>De</p>
                        <input type="number" class="option-numberinput" v-model.number="blockIntervalHours1" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">
                        <span>:</span>
                        <input type="number" class="option-numberinput" v-model.number="blockIntervalMinutes1" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">
                        <p>---</p>
                        <p>Até</p>
                        <input type="number" class="option-numberinput" v-model.number="blockIntervalHours2" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">
                        <span>:</span>
                        <input type="number" class="option-numberinput" v-model.number="blockIntervalMinutes2" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">

                        <p v-if="blockIntervalInconsistency">
                            *O começo do intervalo deve ser menor que o seu fim
                        </p>
                        

                        <div>
                            <input type="checkbox" id="weekday-toggle" v-model="blockWeekDays.blockByWeekday" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)">
                            <label for="weekday-toggle">Aplicar em Dias da Semana?</label>
                            <!--<code>{{blockWeekDays}}</code>-->
                            <div class="settings-option-box wkday-item" v-bind:style="{'display' : (blockWeekDays.blockByWeekday || blockEntryList[selectedBlockentry]?.isBlocked().isBlocked) ? 'flex' : 'none' }">
                                <code class="wkday-item">
                                    <input type="checkbox" id="sun-block" v-model="blockWeekDays.wDays.sunBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)"/>
                                    <label for="sun-block"> &nbsp; - Domingo</label>
                                </code>
                                <code class="wkday-item">
                                    <input type="checkbox" id="mon-block" v-model="blockWeekDays.wDays.monBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)"/>
                                    <label for="mon-block"> &nbsp; - Segunda-feira</label>
                                </code>
                                <code class="wkday-item">
                                    <input type="checkbox" id="tue-block" v-model="blockWeekDays.wDays.tueBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)"/>
                                    <label for="tue-block"> &nbsp; - Terça-feira</label>
                                </code>
                                <code class="wkday-item">
                                    <input type="checkbox" id="wed-block" v-model="blockWeekDays.wDays.wedBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)"/>
                                    <label for="wed-block"> &nbsp; - Quarta-feira</label>
                                </code>
                                <code class="wkday-item">
                                    <input type="checkbox" id="thu-block" v-model="blockWeekDays.wDays.thuBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)"/>
                                    <label for="thu-block"> &nbsp; - Quinta-feira</label>
                                </code>
                                <code class="wkday-item">
                                    <input type="checkbox" id="fri-block" v-model="blockWeekDays.wDays.friBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)"/>
                                    <label for="fri-block"> &nbsp; - Sexta-feira</label>
                                </code>
                                <code class="wkday-item">
                                    <input type="checkbox" id="sat-block" v-model="blockWeekDays.wDays.satBlock" v-on:click="updateWeekDays(blockEntryList[selectedBlockentry]!, blockWeekDays)"/>
                                    <label for="sat-block"> &nbsp; - Sábado</label>
                                </code>
                            </div>

                            <button class="settings-options-button" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked" v-on:click="addBlockHoursInterval(
                                blockEntryList[selectedBlockentry]!,
                                blockIntervalHours1,
                                blockIntervalMinutes1,
                                blockIntervalHours2,
                                blockIntervalMinutes2
                            )">
                            Adicionar Intervalo
                        </button>
                        
                        </div>
                    </div>
                    
                </div>

                <div class="settings-option-box">
                    <p class="option-title">Limite de uso diário</p>
                    <code class="wkday-item" v-if="blockEntryList[selectedBlockentry]?.getDailyLimit()">
                        {{formatHoursMinutes(blockEntryList[selectedBlockentry]?.getAccessTime().today ?? 0)}}/{{formatHoursMinutes(blockEntryList[selectedBlockentry]?.getDailyLimitTime() ?? 0)}}
                    </code>
                    <div>
                        <input type="checkbox" v-model="openDailyLimit" name="limite-diario">
                        <label for="limite-diario">Configurar limite diário</label>
                        <div v-if="openDailyLimit">
                            <!--Adicionar Leading Zeros-->
                            <input type="number" class="option-numberinput" v-model="dailyLimitHours" name="" max="23" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">
                            <span>:</span>
                            <input type="number" class="option-numberinput" v-model="dailyLimitMinutes" id="" max="59" min="0" placeholder="00" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked">
                            
                            <button class="settings-options-button" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked" v-on:click="clearDailyLimit(blockEntryList[selectedBlockentry]!)">
                                Limpar limite
                            </button>

                            <button class="settings-options-button" v-bind:disabled="blockEntryList[selectedBlockentry]?.isBlocked().isBlocked" v-on:click="setDailyLimit(blockEntryList[selectedBlockentry]!, dailyLimitHours, dailyLimitMinutes)">
                                Definir limite
                            </button>
                        </div>
                    </div>
                </div>

                <div class="settings-option-box">
                    <p class="option-title">Bloqueio Breve</p>
                    
                    <div>
                        <input type="checkbox" name="short-block-enabled" id="short-block-enabled" v-model="openShortBlock" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-block-enabled">Habilitar funcionalidade de Bloqueio Breve?</label>
                    </div>
                    <div v-if="openShortBlock">
                        <p>Bloquear após</p>
                        <input type="radio" name="short-block-when" id="short-hour-half" v-bind:value="30*1000*60" v-model="shortBlockLimit" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-hour-half">30 minutos</label>
                        <input type="radio" name="short-block-when" id="short-hour-full" v-bind:value="60*1000*60" v-model="shortBlockLimit" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-hour-full">1 hora</label>
                        <input type="radio" name="short-block-when" id="short-hour-double" v-bind:value="120*1000*60" v-model="shortBlockLimit" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-hour-double">2 horas</label>
                        <input type="radio" name="short-block-when" id="short-hour-fourx" v-bind:value="240*1000*60" v-model="shortBlockLimit" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-hour-fourx">4 horas</label>

                        <p>Duração de bloqueio</p>
                        <input type="radio" name="short-block-dur" id="short-two-min" v-bind:value="2*1000*60" v-model="shortBlockDuration" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-two-min">2 minutos</label>
                        <input type="radio" name="short-block-dur" id="short-five-min" v-bind:value="5*1000*60" v-model="shortBlockDuration" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-five-min">5 minutos</label>
                        <input type="radio" name="short-block-dur" id="short-ten-min" v-bind:value="10*1000*60" v-model="shortBlockDuration" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-ten-min">10 minutos</label>
                        <input type="radio" name="short-block-dur" id="short-thirty-min" v-bind:value="30*1000*60" v-model="shortBlockDuration" v-on:change="updateShortBlock(blockEntryList[selectedBlockentry]!)">
                        <label for="short-thirty-min">30 minutos</label>


                        <p>Bloqueios Breves Opcionais</p>
                        <div>
                            <div>
                                <input type="checkbox" name="autoplay-block" id="autoplay-block" v-model="autoplayBlockEnabled" v-on:change="updateAutoplay(blockEntryList[selectedBlockentry]!)">
                                <label for="autoplay-block">Habilitar Bloqueio de Autoplay/Redirecionamento?</label>
                            </div>
                            <div>
                                <input type="checkbox" name="doomscrolling-block" id="doomscrolling-block" v-model="doomscrollingBlockEnabled" v-on:change="updateDoomscrolling(blockEntryList[selectedBlockentry]!)">
                                <label for="doomscrolling-block">Habilitar Bloqueio de "Doomscrolling"(Páginas sem fim)?</label>
                                <input type="number" v-model.number="doomscrollingBlockRate" max="20000.0" min="500.0" step="100.0" placeholder="4000.0" v-on:change="updateDoomscrolling(blockEntryList[selectedBlockentry]!)" v-bind:disabled="!doomscrollingBlockEnabled">
                            </div>

                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        
    </div>
</template>

<style scoped>

    

</style>