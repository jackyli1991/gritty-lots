<!--
普通容器
@props id?: string
-->
<script setup lang="ts">
  import { useData } from '@neural/composables/useData';

  defineOptions({
    name: 'PageNormalContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const props = defineProps<ContainerProps>();
  // 容器统一入口 index.vue 已触发数据加载，此处仅消费
  const { container, data, loading } = useData(props.id, { autoLoad: false });
</script>

<template>
  <div class="page-normal-container w-full h-full">
    <slot></slot>
    {{ loading }}
    {{ data }}
    {{ container?.id }}

    <!-- <PageNormalContainer v-for="child in container?.children || []" :key="child" :id="child" /> -->
  </div>
</template>
