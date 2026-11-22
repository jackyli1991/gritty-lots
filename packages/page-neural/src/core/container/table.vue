<!--
表格容器
基于 PrimeVue DataTable 的基座，列由配置动态渲染
@props id?: string
-->
<script setup lang="ts">
  import { useData } from '@neural/composables/useData';
  import { getColumnMeta } from '@neural/data/table';
  import {
    resolveColumnProps,
    resolveSelectionMode,
    resolveTableProps,
  } from '@neural/render/utils/table';
  import type { TableColumn, TableModelValue } from '@neural/types/table';
  import Column from 'primevue/column';
  import DataTable from 'primevue/datatable';
  import { computed, ref } from 'vue';

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

  // 容器统一入口 index.vue 已触发数据加载，此处仅消费
  const { container, data, loading } = useData(props.id, { autoLoad: false });

  /** 容器级配置（列 / 空文案 / 选择模式 等） */
  const containerModel = computed<TableModelValue>(
    () => (container.value?.props.containerModel as TableModelValue) || ({} as TableModelValue)
  );

  /** 列配置数组 */
  const columns = computed<TableColumn[]>(() => containerModel.value.columns || []);

  /** 映射到 DataTable 的 selectionMode prop */
  const selectionMode = computed(() => resolveSelectionMode(columns.value));

  /** 选中行（供 selectionMode 使用） */
  const selectedRows = ref<Record<string, unknown>[]>([]);
</script>

<template>
  <DataTable
    v-if="container"
    :value="data"
    class="page-table-container h-full w-full"
    :pt="pt"
    scrollable
    :loading="loading"
    v-bind="resolveTableProps(containerModel)"
    :selection-mode="selectionMode"
    v-model:selection="selectedRows"
  >
    <template v-if="!loading" #empty>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-gray-400 dark:text-gray-500"
      >
        {{ containerModel.emptyText }}
      </div>
    </template>

    <!-- 动态列：按配置顺序渲染，属性映射由 resolveColumnProps 统一处理 -->
    <Column v-for="col in columns" :key="col.id" v-bind="resolveColumnProps(col)">
      <!-- 列类型注册了渲染组件时，用 body 插槽渲染自定义单元格 -->
      <template v-if="getColumnMeta(col.type)?.component" #body="slotProps">
        <component :is="getColumnMeta(col.type)!.component" :row="slotProps.data" :column="col" />
      </template>
    </Column>
  </DataTable>
</template>
