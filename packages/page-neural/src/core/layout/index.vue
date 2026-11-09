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
    <RenderLayout :node="pageNeuralStore.activeLayout!" />
    <!-- 右下角图层与属性面板：左侧图层树，右侧选中节点属性 -->
    <div
      class="absolute right-2 bottom-2 z-100 max-h-[70vh] min-w-[28rem] overflow-y-auto rounded border border-gray-300 bg-white p-2 shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      <Layers :node="pageNeuralStore.activeLayout!" />
    </div>
  </div>
</template>
