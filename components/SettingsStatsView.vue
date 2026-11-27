<script lang="ts" setup>
import { nextTick, ref, onBeforeMount, shallowRef } from 'vue';
import { BlockEntry } from '@/classes/BlockEntry';
//import { BlockEntryImp } from '@/interfaces/BlockEntryImp';
import { parseResultsBlockEntry, formatHoursMinutes } from '@/utils';
import { getBlockEntryList, setBlockEntryList } from '@/storage_utils';
import type { DomainUsageStats } from '@/interfaces/DomainUsageStats';


const blockEntryList = shallowRef<BlockEntry[]>([]);
const mounted = ref<boolean>(false);
const rankedUsage = ref<DomainUsageStats[][]>([]);
const rankedUsageAux = ref<DomainUsageStats[][]>([]);

const mouseCoords = ref<[number, number]>([0,0]);
const mouseHoveringElement = ref<string>('');
const mouseIsHovering = ref<boolean>(false);

const tenMin = 1000 * 60 * 10
const fullDay = 1000 * 60 * 60 * 24;
const minDay = fullDay/3;
const minWeek = minDay * 7
const minMonth = minWeek * 4
const minTotal = [minDay, minWeek, minWeek, minMonth, minMonth, minMonth]

onBeforeMount(async () => {
    blockEntryList.value = await getBlockEntryList();

    await nextTick();

    rankUsage();
    mounted.value = true
    console.log('mounted')
});

function rankUsage(){
    var rankedUsageToday: DomainUsageStats[] = []
    var rankedUsageCurWeek: DomainUsageStats[] = []
    var rankedUsageLastWeek: DomainUsageStats[] = []
    var rankedUsageCurMonth: DomainUsageStats[] = []
    var rankedUsageLastMonth: DomainUsageStats[] = []
    var rankedUsageTotal: DomainUsageStats[] = []
    var rankedColoring: DomainUsageStats[] = []
    var rankedTotal: DomainUsageStats[] = []

    blockEntryList.value.map((blEntry, index)=>{
        rankedUsageToday.push({
            'domainName': blEntry.getDomainName(),
            'count': blEntry.getAccessTime().today
        })
        rankedUsageCurWeek.push({
            'domainName': blEntry.getDomainName(),
            'count': blEntry.getAccessTime().curWeek
        })
        rankedUsageLastWeek.push({
            'domainName': blEntry.getDomainName(),
            'count': blEntry.getAccessTime().lastWeek
        })
        rankedUsageCurMonth.push({
            'domainName': blEntry.getDomainName(),
            'count': blEntry.getAccessTime().curMonth
        })
        rankedUsageLastMonth.push({
            'domainName': blEntry.getDomainName(),
            'count': blEntry.getAccessTime().lastMonth
        })
        rankedUsageTotal.push({
            'domainName': blEntry.getDomainName(),
            'count': blEntry.getAccessTime().total
        })
    })

    rankedUsage.value.push(rankedUsageToday)
    rankedUsage.value.push(rankedUsageCurWeek)
    rankedUsage.value.push(rankedUsageLastWeek)
    rankedUsage.value.push(rankedUsageCurMonth)
    rankedUsage.value.push(rankedUsageLastMonth)
    rankedUsage.value.push(rankedUsageTotal)

    rankedUsage.value.map((val, ind) => {
        val.sort((a,b) => b.count - a.count)
    })

    const topUsed = new Set<string>();
    for (var i = 0; i < Math.min(rankedUsageToday.length, 5); i++){
        rankedUsage.value.map((val, ind) =>{
            var tUs = val[i]
            if (tUs !== undefined){
                topUsed.add(tUs.domainName)
            }
        })
    }

    var msInd = 0 
    topUsed.forEach((tp)=>{
        rankedColoring.push({
            'domainName': tp,
            'count': (msInd++)%5
        })
    })
    rankedColoring.push({
        'domainName': 'outro',
        'count': 5,
    })
    
    const usageTitles = [
        'Hoje',
        'Semana',
        'Semana Ant.',
        'Mês',
        'Mês Ant.',
        'Total'
    ]
    rankedUsage.value.map((val, ind) =>{
        var toRemove: DomainUsageStats[] = [];
        var other: DomainUsageStats = {
            'domainName': 'Outro',
            'count': 0
        }

        var dName = usageTitles[ind]
        if (dName){
        var usageTotal: DomainUsageStats = {
            'domainName': dName,
            'count': 0
        }
        

        val.map((it, index) => {
            usageTotal.count = usageTotal.count + it.count
            if(!topUsed.has(it.domainName)){
                toRemove.push(it);
                other.count = other.count + it.count
            }
        val = val.filter(
            domain => toRemove.findIndex((rmv) => rmv.domainName === domain.domainName) === -1
        );
        val.push(other)
        })

        rankedTotal.push(usageTotal);
        }
    })

    rankedUsageAux.value.push(rankedColoring);
    rankedUsageAux.value.push(rankedTotal);
    console.log(rankedTotal)
}

const colorDict: Record<number, string> = {
    0 : 'b-red',
    1 : 'b-blue',
    2 : 'b-green',
    3 : 'b-yellow',
    4 : 'b-purple',
    5 : 'b-gray',
}

function colorHandling(domUse:DomainUsageStats) {
    let rIdx = rankedUsageAux.value[0]
        if (rIdx){
        let indRes = rIdx.findIndex(id => id.domainName === domUse.domainName)
        if(indRes !== -1){
            return indRes;
        } else {
            return 5;
        }
    } else {
        return 5
    }
}

function getMouseCoords(e:MouseEvent) {
  mouseCoords.value = [ e.x, e.y - 30] 
}

</script>

<template>
    <div class="settings-content" v-if="mounted">
        <p>Estatísticas de Uso</p>
        <div class="settings-item">
            <div class="stats-board">
                <div v-for="(fullBlock, idx) in rankedUsage" class="stats-board-section">
                    <p>{{ formatHoursMinutes(rankedUsageAux[1]?.[idx]?.count ?? 0) }}</p>
                    <div class="stats-board-day" 
                        :style="{minHeight:'11.2rem'
                        }">
                        <div v-for="(statBlock, index) in rankedUsage[idx]" class="stats-board-domains" 
                            :style="{height: `${(Math.max(statBlock.count, tenMin)/(Math.max((rankedUsageAux[1]?.[idx]?.count?? 1)  * 1.2, (minTotal[idx]??1))))*92}%`,
                                minHeight:'1.2rem',
                            }" 
                            :class="colorDict[colorHandling(statBlock)]"
                            v-on:mousemove="getMouseCoords"
                            :hidden="index>5"
                            >
                            <p v-if="index!=5">
                                {{ statBlock.domainName }}
                            </p>
                            <p v-else>
                                Outros +
                            </p>
                            <div 
                                :id="`${idx}-${statBlock.domainName}`" 
                                class="stats-board-tooltip"
                                :style="{
                                    left: `${mouseCoords[0]}px`,
                                    top: `${mouseCoords[1]}px`
                                    }"
                                :class="colorDict[colorHandling(statBlock)]">
                                <p v-if="index!=5">
                                    {{ statBlock.domainName }} => {{ formatHoursMinutes(statBlock.count) }}
                                </p>
                                <p v-else v-for="vle in rankedUsage[idx]?.filter((vl)=>{return vl.count <= (rankedUsage[idx]?.[5]?.count ?? 5)})" :class="colorDict[colorHandling(statBlock)]">
                                    {{vle.domainName}} => {{ formatHoursMinutes(vle.count) }}
                                </p>
                            </div>
                        </div>
                        <p class="stats-board-day-title">
                            {{rankedUsageAux[1]?.[idx]?.domainName}}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

    

</style>