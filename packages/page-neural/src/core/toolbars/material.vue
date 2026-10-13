<script setup lang="ts">
// import { ref } from 'vue';
import type { ToolbarItem } from '@neural/components/toolbar';
import { NeuralToolbar } from '@neural/components';
import { invokeAction, type ActionTree, type Paths } from '@neural/utils/action';

const modelValue = defineModel<boolean>();

const toolbarData: ToolbarItem[][] = [
  [{ label: '组件库', icon: 'Component', key: 'showComponents' }],
];

const actions = {
  showComponents: () => {
    modelValue.value = true;
  },
} satisfies ActionTree;

function handleClick(key: string) {
  invokeAction(actions, key as Paths<typeof actions>);
}

</script>

<template>
  <NeuralToolbar :data="toolbarData" @click="handleClick" />
</template>