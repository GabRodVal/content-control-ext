<script lang="ts" setup>
import { nextTick, ref, onBeforeMount, h } from 'vue';
import { BlockList } from '@/interfaces/BlockList';

//const checked = true
//const isExtensionEnabled = ref(true)
//const isBlockingEnabled = ref(true)
//const isRegisteringEnabled = ref(true)
//const isCosmeticFilteringEnabled = ref(true)
//const isDoomScrollingProtectionEnabled = ref(true)

//const blockLists = ref<BlockList[]>([]);
const blockLists = ref<BlockList[]>([]);

const mounted = ref<boolean>(false)

onBeforeMount(async () => {
    console.log('1')
  await browser.storage.local.get(["blockLists"]).then((result)=>{
    blockLists.value = result.blockLists;
  }).catch((err) => {
    console.error(err)
  }).finally(() =>{
    console.log(mounted.value)
  });

    await nextTick();

    mounted.value = true
    console.log(mounted.value)
});

function renderBlockList(bl: BlockList) {
    console.log(bl)
    bl.blockedSites.map((siteUrl) => {
        return h('tr', [
            h('td', siteUrl),
            h('td', 'N/A'),
            h('td', true),
            h('td', 255)
        ]
        )
    })
}

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
                            <th>Acessos</th>
                        </tr>
                    </thead>
                    <tbody v-if="mounted" class="domain-table-body">
                        <tr v-for="domain in blockLists[0].blockedSites" :key="domain" class="domain-table-row"> 
                            <td class="domain-table-cell"> {{ domain }} </td>
                            <td class="domain-table-cell"> N/A </td>
                            <td class="domain-table-cell"> {{ true }}</td>
                            <td class="domain-table-cell"> 255 </td>
                        </tr>
                        <!--{{/renderBlockList(blockLists[0])}}-->
                    </tbody>
                </table>
            </div>
            <div class="domain-table-operators">
                <div>
                    <button> Adicionar </button>
                    <input type="text" placeholder="novo.site">
                </div>
                <button disabled="true"> Bloquear </button>
                <button disabled> Limpar Configurações </button>
                <button @click="console.log('REMOVIDO')">
                    Remover
                </button>
            </div>
        </div>
        
        <div class="settings-item">
            <p>Frequentemente Visitadas</p>
            <code>SITE 1 - ACESSOS: X - TEMPO DE USO: Y</code>
            <code>SITE 2 - ACESSOS: X - TEMPO DE USO: Y</code>
            <code>SITE 3 - ACESSOS: X - TEMPO DE USO: Y</code>
            <code>SITE 4 - ACESSOS: X - TEMPO DE USO: Y</code>
        </div>
    </div>
</template>

<style scoped>

    .domain-table-container{
        min-height: 55vh;
        overflow-y: auto;
        padding: 0;
        background-color:oklch(27.9% 0.041 260.031);
        border: 1px solid;
        border-radius: 0.4em;
        box-shadow: 0 0.12em 0.2em 0.12em rgba(0, 0, 0, 0.37);
    }

    .domain-table{
        width: 100%;
        border-collapse: collapse;
        background-color:oklch(20.8% 0.042 265.755) ;
    }

    .domain-table-row{
        position: relative;
        text-align: center;
        background-color: oklch(44.6% 0.043 257.281);
        margin: 0;
        border-radius: 0.12em;
        border-collapse: collapse;
        transition: 120ms;
    }

    .domain-table-row:hover{
        background-color: oklch(55.4% 0.046 257.417);
    }

    .domain-table-cell{
        padding-top: 0.4em;
        padding-bottom: 0.4em;
    }

    .domain-table-operators{
        position: relative;
        display: flex;
        margin: auto;
        padding: 0.8;
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
        min-width:60%;
        max-width: 75vw;
        padding: 0.8em;
        margin-top: 0.8em;
        margin-bottom: 0.8em;
        border: 2px solid;
        border-radius: 0.2em;
        border-color: rgba(245, 245, 245, 0.6);
        
    }

</style>