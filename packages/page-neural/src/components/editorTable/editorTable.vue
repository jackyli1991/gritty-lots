<!--
可编辑表格组件
基于 PrimeVue DataTable，支持 v-model 双向绑定数据，列通过 editConfig 控制单元格编辑
-->
<script setup lang="ts">
  import ColorPicker from '@neural/components/colorPicker';
  import { nestedFormControl } from '@neural/composables/useForm';
  import { getColumnMeta } from '@neural/data/table';
  import { resolveColumnProps } from '@neural/render/utils/table';
  import type { BuiltinEditComponentType, TableColumn } from '@neural/types/table';
  import Button from 'primevue/button';
  import Column from 'primevue/column';
  import type { DataTableCellEditCompleteEvent } from 'primevue/datatable';
  import DataTable from 'primevue/datatable';
  import InputNumber from 'primevue/inputnumber';
  import InputText from 'primevue/inputtext';
  import Select from 'primevue/select';
  import { computed, watch, type Component } from 'vue';

  import NeuralIcon from '../icon';

  defineOptions({
    name: 'EditorTable',
  });

  /** 内置编辑组件 key → PrimeVue 组件映射 */
  const EDIT_COMPONENT_MAP: Record<string, Component> = {
    InputText: InputText,
    InputNumber: InputNumber,
    Select: Select,
    ColorPicker: ColorPicker,
  };

  /** 编辑配置中需要剥离的字段，不作为 props 透传给编辑组件 */
  const EDIT_CONFIG_RESERVED = new Set(['enable', 'component', 'options']);

  // ---------- Props & v-model ----------

  const modelValue = defineModel<Record<string, unknown>[]>('modelValue');

  const props = defineProps<{
    /** 列配置数组 */
    columns: TableColumn[];
  }>();

  // ---------- 工具方法 ----------

  const columns = computed<TableColumn[]>(() => props.columns || []);

  /** 末尾操作列配置：固定宽度、内容居中 */
  const ACTION_COLUMN: TableColumn = {
    id: '__action__',
    type: 'button',
    title: '操作',
    field: '',
    width: 80,
    align: 'center',
    fixed: null,
    sortable: false,
  };

  /** 复用列属性映射，保证表头 / 表体对齐方式与其它列一致 */
  const actionColumnProps = computed(() => ({
    ...resolveColumnProps(ACTION_COLUMN),
    header: ACTION_COLUMN.title,
  }));

  /** 初始进入或父组件更新时，若 v-model 传入的是字符串则自动归一化为数组 */
  watch(
    () => modelValue.value as unknown,
    (value) => {
      if (!Array.isArray(value)) {
        console.warn('v-model 必须为数组，已自动归一化为 []');
        modelValue.value = [];
      }
    },
    { immediate: true, once: true }
  );

  /**
   * 解析列的编辑组件。
   */
  function resolveEditComp(col: TableColumn): Component {
    const { component } = col.editConfig || {};
    const key: string = (component as BuiltinEditComponentType) ?? 'InputText';
    return EDIT_COMPONENT_MAP[key] ?? InputText;
  }

  /**
   * 解析传递给编辑组件的 props。
   * - 从 editConfig 中剥离保留字段后透传
   * - Select 组件额外注入 options
   */
  function resolveEditProps(col: TableColumn): Record<string, unknown> {
    const cfg = col.editConfig;
    if (!cfg) return {};

    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(cfg)) {
      if (!EDIT_CONFIG_RESERVED.has(key)) out[key] = val;
    }
    if (cfg.options) out.options = cfg.options;
    return out;
  }

  /** 判断列是否开启编辑 */
  function isEditable(col: TableColumn): boolean {
    return !!col.editConfig?.enable && !!col.field;
  }

  /**
   * 根据 columns 构造一行默认空数据。
   * 可编辑字段按列类型填入基础默认值（string/number/undefined）。
   */
  function buildEmptyRow(): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const col of columns.value) {
      if (!col.field) continue;
      if (!isEditable(col)) continue;
      const cfg = col.editConfig;
      const comp = cfg?.component;
      if (comp === 'InputNumber') {
        row[col.field as string] = 0;
      } else if (comp === 'Select') {
        row[col.field as string] = undefined;
      } else {
        row[col.field as string] = '';
      }
    }
    return row;
  }

  /**
   * 在表格末尾追加一行空数据。
   * 通过替换整个数组引用触发 v-model 更新，避免直接修改 reactive 数组的歧义。
   */
  function addRow(): void {
    const next = [...(modelValue.value ?? []), buildEmptyRow()];
    modelValue.value = next;
  }

  /**
   * 删除指定行。
   * 通过替换整个数组引用触发 v-model 更新。
   */
  function deleteRow(index: number): void {
    const next = [...(modelValue.value ?? [])];
    next.splice(index, 1);
    modelValue.value = next;
  }

  const onCellEditComplete = (event: DataTableCellEditCompleteEvent) => {
    // 颜色选择器弹层经 Portal 挂载到 body，点击弹层会被 DataTable 判定为「单元格外部」而结束编辑。
    // 拦截弹层内部点击，保持编辑态，避免点一次就关闭、无法连续选色。
    const target = event.originalEvent?.target as Element | null;
    if (target?.closest?.('.p-popover')) {
      (
        event as DataTableCellEditCompleteEvent & { preventDefault?: () => void }
      ).preventDefault?.();
      return;
    }

    let { data, newValue, field } = event;
    data[field] = newValue;
  };

  // 暴露方法给父组件：<EditorTable ref="tableRef" /> → tableRef.addRow()
  defineExpose({ addRow });
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <!-- 顶部操作栏：添加行按钮 -->
    <div class="mb-2 flex justify-end">
      <Button size="small" severity="secondary" outlined @click="addRow">
        <NeuralIcon name="Plus" :size="12" class="shrink-0" />
        添加行
      </Button>
    </div>
    <DataTable
      v-if="Array.isArray(modelValue)"
      :value="modelValue"
      class="page-table-container h-full w-full"
      :scrollable="true"
      editMode="cell"
      :pt="{
        table: { style: 'min-width: 50rem' },
        column: {
          bodycell: ({ state }: any) => ({
            class: [{ 'py-0!': state['d_editing'] }],
          }),
        },
      }"
      @cell-edit-complete="onCellEditComplete"
    >
      <template #empty>
        <div class="flex min-h-30 flex-col items-center justify-center gap-3 py-6 text-center">
          <p class="text-xs text-gray-400 dark:text-gray-500">暂无数据</p>
        </div>
      </template>

      <Column v-for="col in columns" :key="col.id" v-bind="resolveColumnProps(col)" :header="''">
        <!-- 表头：可编辑列在标题后追加编辑图标 -->
        <template #header>
          <span class="p-datatable-column-title">
            {{ col.title }}
            <NeuralIcon v-if="isEditable(col)" name="PencilLine" :size="10" class="shrink-0" />
          </span>
        </template>
        <template #body="slotProps">
          <!-- 非编辑模式：复用现有列类型的自定义渲染组件 -->
          <component
            v-if="getColumnMeta(col.type)?.component"
            :is="getColumnMeta(col.type)!.component"
            :row="slotProps.data"
            :column="col"
          />
          <!-- 默认：直接展示字段值 -->
          <template v-else>{{ slotProps.data[col.field as string] }}</template>
        </template>
        <!-- 编辑模式：启用 editConfig.enable 的数据列渲染编辑组件 -->
        <template v-if="isEditable(col)" #editor="{ data }">
          <component
            :is="resolveEditComp(col)"
            v-model="data[col.field as string]"
            v-bind="resolveEditProps(col)"
            size="small"
            :form-control="nestedFormControl"
          />
        </template>
      </Column>

      <!-- 操作列：删除当前行 -->
      <Column v-bind="actionColumnProps">
        <template #body="{ index }">
          <Button severity="danger" text rounded size="small" @click="deleteRow(index)">
            <NeuralIcon name="Trash2" />
            <span>删除</span>
          </Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
