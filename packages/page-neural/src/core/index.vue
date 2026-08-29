<script setup lang="ts">
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import { VueFlow } from '@vue-flow/core';
  import { MiniMap } from '@vue-flow/minimap';
  import { ref } from 'vue';

  // import { NeuralIcon } from '../components';

  // these are our nodes
  const nodes = ref([]);

  // these are our edges
  const edges = ref([]);
</script>

<template>
  <div class="gritty-neural-graph">
    <VueFlow :nodes="nodes" :edges="edges">
      <Background />
      <MiniMap pannable zoomable />
      <Controls />
    </VueFlow>
    <!-- <NeuralIcon class="gritty-neural-database" name="Database" /> -->
    <div></div>
  </div>
</template>

<style lang="scss" scoped>
  .gritty-neural-graph {
    position: relative;
    .gritty-neural-database {
      position: absolute;
      top: 15px;
      left: 15px;
      background-color: #fff;
      padding: 4px;
      border-radius: 4px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.125);
    }
  }
</style>
