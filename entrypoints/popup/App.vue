<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import PopupMenu from '@/components/PopupMenu.vue';

/*const isPopAppMounted = ref(false)

onMounted(async () => {

  isPopAppMounted.value = await getIsInitDone()

  do {
    isPopAppMounted.value = await getIsInitDone()

    if(!isPopAppMounted){
      setTimeout(async () => {},1000)
    }
  } while (!isPopAppMounted)

})*/


async function getIsInitDone() : Promise<boolean>{
  let storageInitiated =  false
  browser.storage.local.get(null).then((result: object) =>{
    storageInitiated = (Object.keys(result).length > 0)
  }).catch((err: string) => console.error(`Error: ${err}`));

  return storageInitiated
}

</script>

<template>
  <PopupMenu/>
</template>


<!-- Passar pra style.css-->
<style scoped>

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
