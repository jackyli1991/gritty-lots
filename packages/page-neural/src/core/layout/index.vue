<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import { storeToRefs } from 'pinia';
  // import Panel from 'primevue/panel';

  import RenderLayout from './renderLayout.vue';

  const pageNeuralStore = usePageNeuralStore();
  const { layouts } = storeToRefs(pageNeuralStore);
</script>

<template>
  <div class="w-full h-full flex">
    <RenderLayout class="flex-1 w-full h-full" :node="layouts" />
    <!-- <Panel class="h-full ml-2 flex! flex-col! overflow-hidden w-[450px]!" header="布局设置"></Panel> -->
  </div>
</template>
