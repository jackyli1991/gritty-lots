<script setup lang="ts">
  // import { Background } from '@vue-flow/background';
  // import { Controls } from '@vue-flow/controls';
  // import { VueFlow } from '@vue-flow/core';
  // import { MiniMap } from '@vue-flow/minimap';
  // import { ref } from 'vue';
  import { NeuralToolbar } from '@neural/components';
  import type { ToolbarItem } from '@neural/components/toolbar';

  const toolbarData: ToolbarItem[][] = [
    [{ label: '组件库', icon: 'Component', key: 'component' }],
    [
      { label: '设置', icon: 'Settings2', key: 'settings' },
      { label: '撤销', icon: 'Undo', key: 'undo' },
      { label: '重做', icon: 'Redo', key: 'redo', disabled: true },
    ],
    [
      { label: '设置', icon: 'Settings2', key: 'settings' },
      { label: '撤销', icon: 'Undo', key: 'undo' },
      {
        label: '删除',
        icon: 'Trash2',
        key: 'trash',
        dropdownList: [
          { label: '删除选中项', icon: 'Trash2', key: 'delete-selected' },
          { label: '清空', key: 'clear-all' },
        ],
      },
      { label: '设置', icon: 'Settings2', key: 'settings' },
      { label: '撤销', icon: 'Undo', key: 'undo' },
    ],
  ];

  function handleClick(key: string) {
    console.log('toolbar click:', key);
  }

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
    <NeuralToolbar :data="toolbarData" @click="handleClick" />
  </div>
</template>

<style lang="scss" scoped>
  .gritty-page-neural-graph {
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
