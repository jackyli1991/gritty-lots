<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  // import { storeToRefs } from 'pinia';
  // import Panel from 'primevue/panel';

  import Layers from './layers.vue';
  import RenderLayout from './renderLayout.vue';

  const pageNeuralStore = usePageNeuralStore();
</script>

<template>
  <div class="relative w-full h-full">
    <RenderLayout :node="pageNeuralStore.layouts" />
    <!-- 右下角图层树：展示 layouts 层级关系 -->
    <div
      class="absolute right-2 bottom-2 z-100 w-60 max-h-72 overflow-y-auto rounded border border-gray-300 bg-white p-2 shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      <Layers :node="pageNeuralStore.layouts" />
    </div>
  </div>
</template>
