<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
  // import { ref } from 'vue';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import { invokeAction, type ActionTree, type Paths } from '@neural/utils/action';

  const toolbarData: ToolbarItem[][] = [
    [{ label: '垂直布局', icon: 'Rows2', key: 'layoutVertical' }],
    [{ label: '水平布局', icon: 'Columns2', key: 'layoutHorizontal' }],
  ];

  const actions = {
    layoutVertical: () => {},
    layoutHorizontal: () => {},
  } satisfies ActionTree;

  function handleClick(key: string) {
    invokeAction(actions, key as Paths<typeof actions>);
  }
</script>

<template>
  <NeuralToolbar :data="toolbarData" @click="handleClick" />
</template>
