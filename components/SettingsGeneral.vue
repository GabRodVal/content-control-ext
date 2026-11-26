<script lang="ts" setup>
import { ref } from 'vue';

//const checked = true
const isExtensionEnabled = ref(true)
const isBlockingEnabled = ref(true)
const isRegisteringEnabled = ref(true)
const isCosmeticFilteringEnabled = ref(true)


const mounted = ref<boolean>(false)


onBeforeMount(async () => {

    const res = await new Promise <{
        currentlyBlocking?: boolean,
        filterEnabled?: boolean,
        statsRegEnabled?: boolean,
    }> ((resolve, reject) => {
        try{
            browser.storage.local.get([
                'currentlyBlocking',
                'filterEnabled',
                'statsRegEnabled',
            ]).then(resolve).catch(reject as any)
        } catch (err) {
            reject(err)
        }
    })


    if (res.currentlyBlocking !== undefined){
        isBlockingEnabled.value = res.currentlyBlocking
    }
    if (res.filterEnabled !== undefined){
        isCosmeticFilteringEnabled.value = res.filterEnabled
    }
    if (res.statsRegEnabled !== undefined){
        isRegisteringEnabled.value = res.statsRegEnabled
    }else {
        console.error('ERRO: currentlyBlocking retorna undefined')
    }

    await nextTick();

    mounted.value = true
});

async function updateBlockOptions(){

    if (mounted){
        try{
            browser.storage.local.set({
                currentlyBlocking: isBlockingEnabled.value,
                filterEnabled: isCosmeticFilteringEnabled.value,
                statsRegEnabled: isRegisteringEnabled.value
            }, ()=>{
                console.log('general updt')
            })
        }catch (err){
            console.error(err)
        }
       
        await nextTick();


    } else {
        console.warn('SettingsGeneral: =>Not Updated...', `mounted:${mounted}`)
    }
}

/*if (isExtensionEnabled){
allcool
else{
return all false
}*/

</script>

<template>
    <div class="settings-content">
        <p>Configurações Gerais</p>
        <div class="settings-item">
            <p> Funcionalidades Básicas</p>
            <div>
                <div>
                    <input type="checkbox" id="blocking-enabled" :disabled="!isExtensionEnabled" v-model="isBlockingEnabled" v-on:change="updateBlockOptions"/>
                    <label for="blocking-enabled"> Habilitar bloqueio de acesso a sites/domínios registrados? ({{ isBlockingEnabled }})</label>
                </div>

                <div>
                    <input type="checkbox" id="stats-enabled" :disabled="!isExtensionEnabled" v-model="isRegisteringEnabled" v-on:change="updateBlockOptions"/>
                    <label for="stats-enabled"> Habilitar registro do tempo de uso de sites/domínios registrados? ({{ isRegisteringEnabled }})</label>
                </div>

                <div>
                    <input type="checkbox" id="comestic-filtering-enabled" :disabled="!isExtensionEnabled" v-model="isCosmeticFilteringEnabled" v-on:change="updateBlockOptions"/>
                    <label for="comestic-filtering-enabled"> Habilitar filtragem cosmética? ({{ isCosmeticFilteringEnabled }})</label>
                </div>

                <!--Desabilitar caso esteja bloqueando-->
                <!--<div>
                    <input type="checkbox" id="override-enabled" :disabled="!isExtensionEnabled" v-model="isOverrideEnabled"/>
                    <label for="override-enabled"> Habilitar a sobreposição de bloqueio? ({{ isOverrideEnabled }})</label>
                </div>-->

            </div>
        </div>
        
        <div class="settings-item">
            <p> Guia de Uso</p>
            <p>Em caso de dúvidas, acesse o guia da extensão</p>
            <code>extensão.guia</code>
        </div>
        <!--Formulário aqui-->
        <div class="settings-item">
            <p> Feedback</p>
            <p>Se possível, responda um rápido formulário sobre sua experiência com a extensão</p>
            <code>formulario.aqui/feedback</code>
        </div>
    </div>
</template>

<style scoped>

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