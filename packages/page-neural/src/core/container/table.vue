<!--
表格容器
基于 PrimeVue DataTable 的基座，列由配置动态渲染
@props id?: string
-->
<script setup lang="ts">
  import { fetchByDataModel } from '@neural/render/utils/fetch';
  import { resolveColumnProps, resolveSelectionMode } from '@neural/render/utils/table';
  import { usePageNeuralStore } from '@neural/store';
  import type { TableColumn } from '@neural/types/table';
  import { useDebounceFn } from '@vueuse/core';
  import Column from 'primevue/column';
  import DataTable from 'primevue/datatable';
  import { computed, ref, watch } from 'vue';

  defineOptions({
    name: 'PageTableContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const props = defineProps<ContainerProps>();

  const pt = ref({
    tablecontainer: {
      class: 'h-full',
    },
    emptymessagecell: {
      class: 'border-0!',
    },
  });

  const pageNeuralStore = usePageNeuralStore();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));

  const containerModel = computed(() => container.value?.props.containerModel || {});

  /** 列配置数组 */
  const columns = computed<TableColumn[]>(() => containerModel.value.columns || []);

  /** 映射到 DataTable 的 selectionMode prop */
  const selectionMode = computed(() => resolveSelectionMode(columns.value));

  /** 容器数据源配置 */
  const dataModel = computed(() => container.value?.props.dataModel || {});

  /** 表格数据 */
  const tableData = ref<Record<string, unknown>[]>([]);

  /** 选中行（供 selectionMode 使用） */
  const selectedRows = ref<Record<string, unknown>[]>([]);

  // 竞态保护：丢弃过期请求结果
  let requestSeq = 0;

  async function runLoad() {
    const seq = ++requestSeq;
    const result = await fetchByDataModel(dataModel.value, pageNeuralStore.dataSources);
    if (seq !== requestSeq) return;
    tableData.value = result;
  }

  // 首次立即执行，后续 300ms 防抖合并连续变更
  const debouncedRunLoad = useDebounceFn(runLoad, 300);
  let firstRun = true;

  watch(
    dataModel,
    () => {
      if (firstRun) {
        firstRun = false;
        runLoad();
      } else {
        debouncedRunLoad();
      }
    },
    { immediate: true, deep: true }
  );
</script>

<template>
  <DataTable
    v-if="container"
    :value="tableData"
    class="page-table-container h-full w-full"
    :pt="pt"
    scrollable
    v-bind="containerModel"
    :selection-mode="selectionMode"
    v-model:selection="selectedRows"
  >
    <template #empty>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-gray-400 dark:text-gray-500"
      >
        {{ containerModel.emptyText }}
      </div>
    </template>

    <!-- 动态列：按配置顺序渲染，属性映射由 resolveColumnProps 统一处理 -->
    <Column v-for="col in columns" :key="col.id" v-bind="resolveColumnProps(col)" />
  </DataTable>
</template>
