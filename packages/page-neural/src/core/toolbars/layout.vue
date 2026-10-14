<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
  // import { ref } from 'vue';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import { invokeAction, type ActionTree, type Paths } from '@neural/utils/action';
  import Button from 'primevue/button';

  const modelValue = defineModel<boolean>();

  const toolbarData: ToolbarItem[][] = [[{ label: '布局', icon: 'Layout', key: 'showLayout' }]];

  const actions = {
    showLayout: () => {
      modelValue.value = true;
    },
  } satisfies ActionTree;

  function handleClick(key: string) {
    invokeAction(actions, key as Paths<typeof actions>);
  }
</script>

<template>
  <NeuralToolbar :data="toolbarData" @click="handleClick" />
  <Button size="small" v-if="modelValue" @click="modelValue = false">完成</Button>
</template>
