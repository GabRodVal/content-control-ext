<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import PopupMenu from '@/components/PopupMenu.vue';


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
