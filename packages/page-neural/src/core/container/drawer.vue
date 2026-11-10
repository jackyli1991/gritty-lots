<!--
抽屉容器
基于 PrimeVue Drawer 的基座，常驻可见、无遮罩，避免锁定态下被误关闭
@props id?: string
-->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import Drawer from 'primevue/drawer';
  import { computed } from 'vue';

  defineOptions({
    name: 'PageDrawerContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
</script>

<template>
  <Drawer
    v-if="container"
    :visible="true"
    position="right"
    :modal="false"
    :dismissable="false"
    :show-close-icon="false"
    :block-scroll="false"
    header="抽屉容器"
  >
    <div class="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
      抽屉容器
    </div>
  </Drawer>
</template>
