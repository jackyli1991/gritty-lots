<!--
表格容器
基于 PrimeVue DataTable 的基座，列由配置动态渲染
@props id?: string
-->
<script setup lang="ts">
  import { useData } from '@neural/composables/useData';
  import { getColumnMeta, isDataColumn } from '@neural/data/table';
  import ActionColumn from '@neural/render/table/cells/action.vue';
  import {
    resolveColumnProps,
    resolveSelectionMode,
    resolveTableProps,
    resolveFieldOriginData,
    resolveFieldPrefix,
    resolveFieldSuffix,
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

  // 容器统一入口 index.vue 已触发数据加载，此处仅消费
  const { container, data, loading, extraFieldsData } = useData(props.id, {
    autoLoad: false,
    extraFields: ['total'],
  });

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

  /** 数据缺省占位：字段为 undefined / null 时展示，未配置时默认 '-' */
  const emptyCellPlaceholder = computed(() => containerModel.value.emptyCellPlaceholder ?? '-');

  /** 字段值是否为空：undefined / null / '' 视为空 */
  function isEmptyFieldValue(value: unknown): boolean {
    return value === undefined || value === null || value === '';
  }
</script>

<template>
  <DataTable
    v-if="container && Array.isArray(data)"
    :value="data"
    v-bind="resolveTableProps(containerModel)"
    class="page-table-container h-full w-full"
    :loading="loading"
    :first="0"
    :totalRecords="extraFieldsData.total as number"
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
      <!-- 自动序号列 -->
      <template v-if="col.type === 'index'" #body="slotProps">{{ slotProps.index + 1 }}</template>
      <!-- 数据列 -->
      <template v-else-if="isDataColumn(col.type)" #body="slotProps">
        <!-- 字段为 undefined / null / '' 时展示缺省占位 -->
        <template v-if="isEmptyFieldValue(resolveFieldOriginData(slotProps.data, col.field))">
          {{ emptyCellPlaceholder }}
        </template>
        <!-- 列类型注册了渲染组件时，用组件渲染自定义单元格 -->
        <component
          v-else-if="getColumnMeta(col.type)?.component"
          :is="getColumnMeta(col.type)!.component"
          :row="slotProps.data"
          :column="col"
        />
        <template v-else>
          {{ resolveFieldPrefix(col.field) }}
          {{ resolveFieldOriginData(slotProps.data, col.field) }}
          {{ resolveFieldSuffix(col.field) }}
        </template>
      </template>
    </Column>
    <!-- 操作列 -->
    <Column
      v-if="containerModel?.actionColumnConfig?.enable"
      v-bind="resolveColumnProps(containerModel.actionColumnConfig || {})"
    >
      <template #body="slotProps">
        <ActionColumn
          :row="slotProps.data"
          :column="containerModel.actionColumnConfig || {}"
          :actionBtns="containerModel.actionBtns || []"
        />
      </template>
    </Column>
  </DataTable>
</template>
