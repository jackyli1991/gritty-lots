<!--
普通容器
@props id?: string
-->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import { computed } from 'vue';

  defineOptions({
    name: 'PageNormalContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
</script>

<template>
  <div class="page-normal-container w-full h-full">
    <slot></slot>
    <PageNormalContainer v-for="child in container?.children || []" :key="child" :id="child" />
  </div>
</template>
