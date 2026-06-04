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
const blockList = ref<BlockEntry[]>([]);

const mounted = ref<boolean>(false)

onBeforeMount(async () => {
    console.log('1')
  await browser.storage.local.get(["blockList"]).then((result)=>{
    blockList.value = parseResultsBlockEntry(result.blockList);
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
                            <th>T. Acesso</th>
                        </tr>
                    </thead>
                    <tbody v-if="mounted" class="domain-table-body">
                        <tr v-for="domain in blockList" class="domain-table-row"> 
                            <td class="domain-table-cell"> {{ domain.getDomainName() }} </td>
                            <td class="domain-table-cell"> {{ domain.getLastAccess() }} </td>
                            <td class="domain-table-cell"> {{ !domain.isBlocked() }}</td>
                            <td class="domain-table-cell"> {{`${(domain.getAccessTime().total)/1000}s`}} </td>
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