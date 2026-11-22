<script lang="ts" setup>
import { nextTick, ref, onBeforeMount, h } from 'vue';
import { BlockEntry } from '@/classes/BlockEntry';
import { formatHoursMinutes, parseResultsBlockEntry } from '@/utils';

//const checked = true
//const isExtensionEnabled = ref(true)
//const isBlockingEnabled = ref(true)
//const isRegisteringEnabled = ref(true)
//const isCosmeticFilteringEnabled = ref(true)
//const isDoomScrollingProtectionEnabled = ref(true)

//const blockLists = ref<BlockList[]>([]);
const filterList = ref<string[]>([]);

const mounted = ref<boolean>(false)

onBeforeMount(async () => {
    console.log('1')
  await browser.storage.local.get(["filterList"]).then((result)=>{
    filterList.value = result.filterList
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
        <p> Filtros Registrados</p>
        <input id="enable-filter" type="checkbox">
        <label for="enable-filter">Habilitar filtragem cosmética?</label>
        <div class="settings-item filter-container">
            <code class="filter-list" v-for="flt in filterList">
                {{flt}}
            </code>
        </div>
    </div>
</template>

<style scoped>

    .filter-container{
        max-height: 80vh;
        width: 80%;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .filter-list{
        display: flex;
        flex-direction: row;
    }

    .settings-content{
        width: 100%;
        padding: 1.2em;
        border: 3px solid;
        border-radius: 0.2em;
        border-color: rgba(245, 245, 245, 0.6);
    }

    .settings-item{
        display:flex;
        flex-direction: column;
        width:60%;
        padding: 0.8em;
        margin-top: 0.8em;
        margin-bottom: 0.8em;
        border: 2px solid;
        border-radius: 0.2em;
        border-color: rgba(245, 245, 245, 0.6);
        
    }

</style>