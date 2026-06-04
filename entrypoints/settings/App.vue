<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import SettingsGeneral from '@/components/SettingsGeneral.vue';
import SettingsBlockList from '@/components/SettingsBlockList.vue';
import SettingsBlockOptions from '@/components/SettingsBlockOptions.vue';

/*const settings = ref({ option1: false });

onMounted(async () => {
  const stored = await chrome.storage.sync.get('settings');
  if (stored.settings) settings.value = stored.settings;
});

const saveSettings = async () => {
  await chrome.storage.sync.set({ settings: settings.value });
};*/

//Melhorar aplicação
const settingsState = ref([
  //General
  true,
  //BlockList
  false,
  false,
  false,
  false,
])

type settingsSections = 0 | 1 | 2 | 3 | 4

function setSettingsState(st: settingsSections){
  for (var f = 0; f<5; f++){
    if (f === st){
      settingsState.value[f] = true
    }else{
      settingsState.value[f] = false
    }
  }
}

</script>

<template>
  <div class="settings-background">
    <div class="settings-sidebar">
      <p> Configurações </p>
      <ul>
        <li class="sidebar-item" @click="setSettingsState(0)">Geral</li>
        <li class="sidebar-item" @click="setSettingsState(1)">Páginas Registradas</li>
        <li class="sidebar-item" @click="setSettingsState(2)">Opções de Bloqueio</li>
        <li class="sidebar-item" @click="setSettingsState(3)">Estatisticas de Uso</li>
        <li class="sidebar-item" @click="setSettingsState(4)">Outros</li>
      </ul>
    </div>

    <div class="settings-body">

      <SettingsGeneral v-if="settingsState[0]"/>
      <SettingsBlockList v-if="settingsState[1]"/>
      <SettingsBlockOptions v-if="settingsState[2]"/>
    </div>

  </div>
</template>


<!-- Passar pra style.css-->
<style scoped>

  .settings-background{
    position: relative;
    width: 100%;
    height:100%;
    margin: 0;
    display: flex;
    flex-direction: row;
    background-color: oklch(20.8% 0.042 265.755);
    overflow-y: scroll;
    color:whitesmoke;
  }

  .settings-sidebar{
    width: 100%;
    max-width: 20vw;
    height: 100vh;
    position: relative;
    padding: 1.2em;
    background-color: oklch(37.2% 0.044 257.287);
  }

  ul{
    list-style-type: none;
    padding: 0;
  }

  .sidebar-item{
    padding: 0.4em;
    margin: 0.4em;
    border-radius: 0.12em;
    background-color: oklch(44.6% 0.043 257.281);
    cursor: pointer;
    transition: 120ms;
  }

  .sidebar-item:hover{
    background-color: oklch(55.4% 0.046 257.417);
  }

  .settings-body{
    position: relative;
    display: flex;
    width: 100%;
    max-width: 72vw;
    height: 100%;
    margin:1em;
    padding: 1.2em;
    border-radius: 0.8em;
    background-color: oklch(37.2% 0.044 257.287);
    }

</style>
