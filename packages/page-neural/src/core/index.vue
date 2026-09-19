<script setup lang="ts">
  // import { Background } from '@vue-flow/background';
  // import { Controls } from '@vue-flow/controls';
  // import { VueFlow } from '@vue-flow/core';
  // import { MiniMap } from '@vue-flow/minimap';
  // import { ref } from 'vue';
  import NeuralIcon from '@neural/components/icon/icon.vue';
  import Button from 'primevue/button';

  // // these are our nodes
  // const nodes = ref([]);

  // // these are our edges
  // const edges = ref([]);
</script>

<template>
  <div class="gritty-page-neural-graph">
    <!-- <VueFlow :nodes="nodes" :edges="edges">
      <Background />
      <MiniMap pannable zoomable />
      <Controls />
    </VueFlow>
    <div></div> -->
    <NeuralIcon name="Component" />
    <Button label="按钮" />
  </div>
</template>

<style lang="scss" scoped>
  .gritty-page-neural-graph {
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
