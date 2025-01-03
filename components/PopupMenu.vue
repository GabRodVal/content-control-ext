<script lang="ts" setup>
import { ref } from 'vue';


const curDomain = ref("");
const treco = ref("");

onMounted(async () => {
  const result = await browser.storage.local.get(["defaultBlockList"]);
  treco.value = result.defaultBlockList;
  await handleBlockColor();
});


async function getCurrentDomain(): Promise<string> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tabUrl: string | undefined = tabs[0]?.url;
      if (tabUrl) {
        const url = new URL(tabUrl);
        const domain = url.hostname;
        const domainParts = domain.split(".").reverse();
        if (domainParts.length > 1) {
          return `${domainParts[1]}.${domainParts[0]}`;
        }
      } else {
        console.error("URL indefinida");
        return "N/A";
      }
    }
    return "N/A";
  } catch (error) {
    console.error("Erro ao acessar domínio da aba:", error);
    return "N/A";
  }
}

async function logDomain(){
  const domain = await getCurrentDomain();
  curDomain.value = domain;
}

async function toggleBlock(){

  const block = await browser.storage.local.get(["currentlyBlocking"]);

  const blockButton = document.getElementById("blocking-button");
  if (blockButton != null){
    if (block.currentlyBlocking){
      blockButton.style.backgroundColor = "#cf0000";
    } else {
      blockButton.style.backgroundColor = "limegreen";
    }
  }

  browser.storage.local.set({currentlyBlocking: !block.currentlyBlocking}, () => {});
}

async function handleBlockColor(){
  const block = await browser.storage.local.get(["currentlyBlocking"]);

  const blockButton = document.getElementById("blocking-button");
  if (blockButton != null){
    if (!block.currentlyBlocking){
      blockButton.style.backgroundColor = "#cf0000";
    } else {
      blockButton.style.backgroundColor = "limegreen";
    }
  }
}



</script>

<template>
  <div class="card">

    <button id="blocking-button" type="button" @click="toggleBlock">BLOCK</button>
    
    <div>
      <p>Sites Bloqueados:</p>
      <p>{{ treco }}</p>
    </div>
    

    <div class="domain-box">
      <button class="menu-button" type="button" @click="logDomain"> Mostrar domínio atual</button>
      <code id="domain-code" v-if="curDomain !== ''">{{curDomain}}</code>
    </div>
  </div>
</template>

<style scoped>
.domain-box{
  display: flex;
  flex-direction: column;
  background-color: lightgrey;
  border-radius: 0.4rem;
}

.menu-button{
  color:whitesmoke;
  background-color: limegreen;

}

#blocking-button{
  color: whitesmoke;
}

#domain-code{
  position: relative;
  height: 2rem;
  font-size: 1rem;
  margin-top: auto;
}
</style>
