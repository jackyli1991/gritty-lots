<!--
表格容器
基于 PrimeVue DataTable 的基座，列与内部元素渲染后续实现
@props id?: string
-->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import Column from 'primevue/column';
  import DataTable from 'primevue/datatable';
  import { computed, ref } from 'vue';

  defineOptions({
    name: 'PageTableContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pt = ref({
    tablecontainer: {
      class: 'h-full',
    },
    emptymessagecell: {
      class: 'border-0!',
    },
  });

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
</script>

<template>
  <DataTable
    v-if="container"
    :value="[]"
    class="page-table-container h-full w-full"
    size="large"
    :pt="pt"
  >
    <template #empty>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-gray-400 dark:text-gray-500"
      >
        暂无数据
      </div>
    </template>
    <Column field="name" header="c1" />
    <Column field="age" header="c2" />
    <Column field="email" header="c3" />
  </DataTable>
</template>
