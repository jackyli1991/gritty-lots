<template>
  <component :is="ContainerAttrs" />
</template>

<script lang="ts" setup>
  import { usePageNeuralStore } from '@neural/store';
  import type { Component } from 'vue';
  import { computed } from 'vue';

  import TableAttrs from './table.vue';

  defineOptions({ name: 'ContainerAttrs' });

  const maps: Record<string, Component> = {
    table: TableAttrs,
  };

  const pageNeuralStore = usePageNeuralStore();
  const container = computed(() =>
    pageNeuralStore.getContainer(pageNeuralStore.activeContainerId || '')
  );

  const ContainerAttrs = computed(() => {
    const subType = container.value?.subType || '';
    return maps[subType] || null;
  });
</script>
