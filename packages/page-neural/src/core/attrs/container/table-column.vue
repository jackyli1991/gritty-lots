<template>
  <div class="flex flex-col gap-2">
    <!-- 顶部工具条：添加列 -->
    <div class="flex shrink-0 items-center justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="shrink-0 text-xs text-gray-500 dark:text-gray-400"
          >共 {{ model.length }} 列</span
        >
        <!-- 搜索框：按标题 / 字段 / 类型过滤左侧列列表 -->
        <InputText
          v-model="keyword"
          class="w-50"
          size="small"
          placeholder="按标题、类型、字段快速检索"
          :formControl="{ noValidate: true }"
        />
      </div>
      <div class="relative shrink-0">
        <Button size="small" :disabled="availableTypes === 0" @click="toggleAddMenu">
          <NeuralIcon name="Plus" :size="14" />
          <span class="ml-1">添加列</span>
        </Button>
        <!-- 弹层：列出所有列类型，已被占用的单例类型置灰 -->
        <Popover ref="addMenuPopover">
          <Listbox
            :options="allTypeOptions()"
            option-label="label"
            option-value="value"
            option-disabled="disabled"
            size="small"
            class="min-w-[160px]"
            :form-control="{ novalidate: true }"
            @update:modelValue="addColumn"
          >
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <NeuralIcon :name="TYPE_ICON[option.value as TableColumnType]" :size="13" />
                <span>{{ option.label }}</span>
                <span
                  v-if="option.disabled"
                  class="ml-auto text-[10px] text-gray-400 dark:text-gray-500"
                >
                  已存在
                </span>
              </div>
            </template>
          </Listbox>
        </Popover>
      </div>
    </div>

    <!-- 上：Tab 头部（PrimeVue ScrollArea 横向滚动 + 拖拽排序） -->
    <ScrollArea class="shrink-0 rounded-md border border-gray-200 dark:border-gray-700">
      <ScrollAreaViewport class="!overflow-y-hidden">
        <ScrollAreaContent class="flex items-center gap-2 px-1 py-1">
          <template v-if="filteredColumns.length > 0">
            <SortableColumnItem
              v-for="({ col, index: sourceIndex }, position) in filteredColumns"
              :key="col.id"
              :id="col.id"
              :index="position"
              :disabled="isFiltering"
              group="table-columns"
              class="group flex shrink-0 cursor-grab items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-[color,background-color,border-color] duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="
                activeId === col.id
                  ? 'border-b-2 border-(--p-primary-500) bg-gray-100 text-(--p-primary-500) dark:bg-gray-800'
                  : 'border-b-2 border-transparent text-gray-600 dark:text-gray-300'
              "
              @click="selectColumn(col)"
            >
              <div class="flex flex-row items-center gap-1.5">
                <NeuralIcon :name="TYPE_ICON[col.type]" :size="13" />
                <span class="max-w-[140px] truncate font-medium">{{ col.title || '未命名' }}</span>
                <!-- 操作按钮：flex 流内紧跟文字右侧；默认宽度折叠为 0 不占位，hover 展开 -->
                <div
                  class="ml-1 flex shrink-0 items-center gap-0.5 overflow-hidden opacity-0 transition-[width,opacity] duration-150 group-hover:w-auto group-hover:opacity-100"
                >
                  <Button
                    text
                    icon-only
                    size="small"
                    :disabled="SINGLETON_COLUMN_TYPES.has(col.type)"
                    @click.stop="copyColumn(sourceIndex)"
                  >
                    <NeuralIcon name="Copy" :size="12" />
                  </Button>
                  <Button
                    text
                    icon-only
                    size="small"
                    severity="danger"
                    @click.stop="removeColumn(sourceIndex)"
                  >
                    <NeuralIcon name="Trash2" :size="12" />
                  </Button>
                </div>
              </div>
            </SortableColumnItem>
          </template>

          <!-- Tab 头部空态：区分"未找到匹配"和"无列" -->
          <div
            v-else
            class="flex w-full shrink-0 flex-col items-center gap-1 py-3 text-xs text-gray-400 dark:text-gray-500"
          >
            <NeuralIcon :name="isFiltering ? 'SearchX' : 'Table2'" :size="16" />
            <span>{{ isFiltering ? '未找到匹配的列' : '暂无列，点击右上角添加' }}</span>
          </div>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaHandle />
      </ScrollAreaScrollbar>
    </ScrollArea>

    <!-- 下：选中列的配置表单 -->
    <div
      class="flex min-h-[300px] max-h-[400px] flex-1 flex-col gap-2 overflow-auto rounded-md border border-gray-200 p-2 dark:border-gray-700"
    >
      <template v-if="activeColumn">
        <NeuralForm
          :key="activeColumn.id"
          :model-value="activeColumn"
          :schema="columnSchema"
          :rules="columnRules"
          :columns="3"
          @update:model-value="onColumnChange"
        />

        <span
          v-if="!isDataColumn(activeColumn.type)"
          class="text-[11px] text-gray-400 dark:text-gray-500"
        >
          内置列，仅支持配置标题与类型
        </span>
      </template>

      <!-- 未选中：顶部可能有过滤导致当前无选中，或数组初始为空 -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500"
      >
        <NeuralIcon name="MousePointerClick" :size="20" />
        <span>{{ model.length > 0 ? '点击顶部列进行配置' : '暂无列，点击右上角添加' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDragDropMonitor } from '@dnd-kit/vue';
  import { isSortable } from '@dnd-kit/vue/sortable';
  import { NeuralIcon, NeuralForm } from '@neural/components';
  import type { FormItemProps } from '@neural/components/form';
  import {
    ALIGN_OPTIONS,
    ALL_TYPE_VALUES,
    FIXED_OPTIONS,
    SINGLETON_COLUMN_TYPES,
    TABLE_COLUMN_TYPE_LABEL,
    TYPE_ICON,
    isDataColumn,
  } from '@neural/data/table';
  import type { TableColumn, TableColumnType } from '@neural/types/table';
  import { generateId } from '@neural/utils';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Listbox from 'primevue/listbox';
  import Popover from 'primevue/popover';
  import ScrollArea from 'primevue/scrollarea';
  import ScrollAreaContent from 'primevue/scrollareacontent';
  import ScrollAreaHandle from 'primevue/scrollareahandle';
  import ScrollAreaScrollbar from 'primevue/scrollareascrollbar';
  import ScrollAreaViewport from 'primevue/scrollareaviewport';
  import type { DefineComponent } from 'vue';
  import { computed, ref, useTemplateRef, watch } from 'vue';
  import { z } from 'zod';

  import SortableColumnItem from './sortable-column-item.vue';

  defineOptions({ name: 'ColumnAttrs' });

  const model = defineModel<TableColumn[]>({ default: () => [] });

  /** 提交变更：以新数组回写，保证视图与表单同步更新 */
  function commit() {
    model.value = model.value.map((col) => ({ ...col }));
  }

  /** 添加列弹层引用 */
  const addMenuPopover = useTemplateRef<DefineComponent<typeof Popover>>('addMenuPopover');

  /** 打开/关闭添加列弹层 */
  function toggleAddMenu(event: MouseEvent) {
    addMenuPopover.value?.toggle(event);
  }

  /** 当前选中的列 id */
  const activeId = ref('');

  /** 列搜索关键字 */
  const keyword = ref('');

  /** 是否处于搜索过滤状态（过滤时禁用拖拽，避免可见索引与真实索引错位） */
  const isFiltering = computed(() => keyword.value.trim().length > 0);

  /** 关键字是否命中列的标题、类型名称或字段名 */
  function matchKeyword(col: TableColumn, keywordText: string): boolean {
    return [col.title, TABLE_COLUMN_TYPE_LABEL[col.type], col.field].some((text) =>
      text?.toLowerCase().includes(keywordText)
    );
  }

  /** 搜索过滤后的列，附带原始索引供复制、删除使用；支持空格分隔多关键字（需全部命中） */
  const filteredColumns = computed(() => {
    const keywords = keyword.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return model.value
      .map((col, index) => ({ col, index }))
      .filter(({ col }) => keywords.every((item) => matchKeyword(col, item)));
  });

  /** 当前选中的列 */
  const activeColumn = computed(() => model.value.find((col) => col.id === activeId.value) ?? null);

  /** 数据列专属字段的隐藏联动：非数据列不渲染字段/宽度/对齐/固定/排序 */
  const hideForNonDataColumn = {
    trigger: ['type'],
    resolve: ({ values }: { values: Record<string, any> }) => ({
      hidden: !isDataColumn(values.type as TableColumnType),
    }),
  };

  /** 选中列的配置表单 schema */
  const columnSchema = computed<FormItemProps[]>(() => {
    const occupied = occupiedSingletonTypes();
    return [
      {
        fieldName: 'title',
        label: '标题',
        component: 'Input',
        componentProps: { placeholder: '列标题' },
      },
      {
        fieldName: 'type',
        label: '类型',
        component: 'Select',
        componentProps: {
          optionLabel: 'label',
          optionValue: 'value',
          optionDisabled: (option: { disabled: boolean }) => option.disabled,
          options: ALL_TYPE_VALUES.map((type) => ({
            label: TABLE_COLUMN_TYPE_LABEL[type],
            value: type,
            disabled:
              SINGLETON_COLUMN_TYPES.has(type) &&
              occupied.has(type) &&
              type !== activeColumn.value?.type,
          })),
        },
      },
      {
        fieldName: 'field',
        label: '字段',
        component: 'Input',
        componentProps: { placeholder: '绑定字段' },
        dependencies: hideForNonDataColumn,
      },
      {
        fieldName: 'width',
        label: '宽度',
        component: 'InputNumber',
        componentProps: { min: 0, showButtons: false, placeholder: '自适应' },
        dependencies: hideForNonDataColumn,
      },
      {
        fieldName: 'align',
        label: '对齐',
        component: 'Select',
        componentProps: {
          optionLabel: 'label',
          optionValue: 'value',
          options: ALIGN_OPTIONS,
        },
        dependencies: hideForNonDataColumn,
      },
      {
        fieldName: 'fixed',
        label: '固定',
        component: 'Select',
        componentProps: {
          optionLabel: 'label',
          optionValue: 'value',
          options: FIXED_OPTIONS,
          showClear: true,
        },
        dependencies: hideForNonDataColumn,
      },
      {
        fieldName: 'sortable',
        label: '可排序',
        component: 'ToggleSwitch',
        componentProps: {},
        dependencies: hideForNonDataColumn,
      },
    ];
  });

  /** 列配置表单校验规则（暂无需校验字段） */
  const columnRules = z.object({});

  /** 同步列配置到列数组，保持 id 不变并触发表单更新 */
  function onColumnChange(value: Record<string, any> | undefined) {
    if (!value) return;
    model.value = model.value.map((col) =>
      col.id === activeId.value ? ({ ...col, ...value, id: col.id } as TableColumn) : col
    );
  }

  /** 当前已被占用的单例类型 */
  const occupiedSingletonTypes = (): Set<TableColumnType> =>
    new Set(model.value.map((c) => c.type).filter((t) => SINGLETON_COLUMN_TYPES.has(t)));

  /** 添加列按钮下拉的完整选项（含 disabled 状态） */
  function allTypeOptions(): {
    value: TableColumnType;
    label: string;
    disabled: boolean;
  }[] {
    const occupied = occupiedSingletonTypes();
    return ALL_TYPE_VALUES.map((t) => ({
      value: t,
      label: TABLE_COLUMN_TYPE_LABEL[t],
      disabled: SINGLETON_COLUMN_TYPES.has(t) && occupied.has(t),
    }));
  }

  /** 非禁用的可用类型数 */
  const availableTypes = computed(() => allTypeOptions().filter((o) => !o.disabled).length);

  /** 添加新列并选中 */
  function addColumn(type: TableColumnType) {
    if (SINGLETON_COLUMN_TYPES.has(type) && occupiedSingletonTypes().has(type)) return;
    const column = createNewColumn(type);
    model.value.push(column);
    activeId.value = column.id;
    addMenuPopover.value?.hide();
    commit();
  }

  /** 构造新列默认值 */
  function createNewColumn(type: TableColumnType): TableColumn {
    return {
      id: generateId('col'),
      type,
      title: TABLE_COLUMN_TYPE_LABEL[type],
      field: '',
      width: null,
      align: 'left',
      fixed: null,
      sortable: false,
    };
  }

  /** 选中列 */
  function selectColumn(col: TableColumn) {
    activeId.value = col.id;
  }

  /** 复制列：在当前列后插入同配置的新列并选中 */
  function copyColumn(index: number) {
    const source = model.value[index];
    if (!source) return;
    const column: TableColumn = { ...source, id: generateId('col') };
    model.value.splice(index + 1, 0, column);
    activeId.value = column.id;
    commit();
  }

  /** 删除列：保持选中有效项 */
  function removeColumn(index: number) {
    const [removed] = model.value.splice(index, 1);
    if (removed?.id === activeId.value) {
      const next = model.value[index] ?? model.value[index - 1];
      activeId.value = next?.id ?? '';
    }
    commit();
  }

  /** 列拖拽排序组标识，避免与页面其他拖拽区域互相干扰 */
  const COLUMN_SORT_GROUP = 'table-columns';

  /** 拖拽结束后按可排序项索引重排列数组 */
  useDragDropMonitor({
    onDragEnd(event) {
      if (event.canceled) return;
      const { source } = event.operation;
      if (!source || !isSortable(source) || source.group !== COLUMN_SORT_GROUP) return;
      const from = source.initialIndex;
      const to = source.index;
      if (from === to) return;
      const list = [...model.value];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      model.value = list;
    },
  });

  // 选中项失效（外部替换/删除）时，回退到第一列
  watch(
    () => model.value.map((col) => col.id).join(','),
    () => {
      if (activeColumn.value) return;
      activeId.value = model.value[0]?.id ?? '';
    },
    { immediate: true }
  );
</script>
