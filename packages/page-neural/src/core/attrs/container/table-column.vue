<template>
  <div class="flex flex-col gap-2 rounded-md border border-gray-200 p-2 dark:border-gray-700">
    <!-- 顶部工具条：添加列 -->
    <div class="flex shrink-0 items-center justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <!-- 搜索框：按标题 / 字段 / 类型过滤左侧列列表 -->
        <InputText
          v-model="keyword"
          class="w-50 border-0! border-b-1!"
          size="small"
          :pt="{
            root: {
              style: {
                borderRadius: 0,
              },
            },
          }"
          placeholder="按标题、类型、字段快速检索"
          :formControl="{ noValidate: true }"
        />
        <!-- <span class="shrink-0 text-xs text-gray-500 dark:text-gray-400"
          >共 {{ model.length }} 列</span
        > -->
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <!-- 选中列的复制 / 删除操作 -->
        <div class="flex items-center gap-0.5">
          <Button text size="small" :disabled="!canCopyActive" @click="copyColumn(activeIndex)">
            <NeuralIcon name="Copy" :size="12" />
            <span>复制</span>
          </Button>
          <Button
            text
            size="small"
            severity="danger"
            :disabled="!activeColumn"
            @click="removeColumn(activeIndex)"
          >
            <NeuralIcon name="Trash2" :size="12" />
            <span>删除</span>
          </Button>
        </div>
        <div class="relative shrink-0">
          <Button size="small" :disabled="availableTypes === 0" @click="toggleAddMenu">
            <NeuralIcon name="Plus" :size="14" />
            <span>添加列</span>
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
    </div>

    <!-- 上：Tab 头部（PrimeVue ScrollArea 横向滚动 + 拖拽排序） -->
    <ScrollArea class="border-0!">
      <ScrollAreaViewport class="px-0! py-2!">
        <ScrollAreaContent>
          <div v-if="filteredColumns.length > 0" class="flex items-center flex-nowrap gap-2 pb-1">
            <SortableItem
              v-for="(col, position) in filteredColumns"
              :key="col.id"
              :id="col.id"
              :index="position"
              :disabled="isFiltering"
              type="sortableColumn"
              :data="{
                name: `${col.title || '未命名'}${col.field ? `(${col.field})` : ''}`,
                icon: TYPE_ICON[col.type],
              }"
              group="table-columns"
              class="group inline-block flex shrink-0 cursor-grab items-center gap-1.5 rounded px-1.5 py-1 text-xs transition-[color,background-color,border-color] duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="
                activeId === col.id
                  ? 'border-b-2 border-(--p-primary-500) bg-gray-100 text-(--p-primary-500) dark:bg-gray-800'
                  : 'border-b-2 border-transparent text-gray-600 dark:text-gray-300'
              "
              @click="selectColumn(col)"
            >
              <div class="flex flex-row items-center gap-1.5">
                <NeuralIcon :name="TYPE_ICON[col.type]" :size="14" />
                <span class="max-w-[140px] truncate font-medium"
                  >{{ col.title || '未命名' }}{{ col.field ? `(${col.field})` : '' }}</span
                >
              </div>
            </SortableItem>
          </div>

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
    <div class="flex flex-1 flex-col gap-2 overflow-auto">
      <template v-if="activeColumn">
        <NeuralForm
          :key="activeColumn.id"
          :model-value="activeColumn"
          :schema="columnSchema"
          :rules="columnRules"
          :columns="3"
          @update:model-value="onColumnChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDragDropMonitor } from '@dnd-kit/vue';
  import { isSortable } from '@dnd-kit/vue/sortable';
  import { NeuralIcon, NeuralForm } from '@neural/components';
  import type { FormItemProps } from '@neural/components/form';
  import { createTableColumn, getColumnSchema } from '@neural/core/forms/table-column';
  import {
    ALL_TYPE_VALUES,
    TABLE_COLUMN_TYPE_LABEL,
    TYPE_ICON,
    getBlockedColumnTypes,
    isColumnTypeBlocked,
  } from '@neural/data/table';
  import SortableItem from '@neural/dnd/components/sortableItem.vue';
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

  /** 搜索过滤后的列；支持空格分隔多关键字（需全部命中） */
  const filteredColumns = computed(() => {
    const keywords = keyword.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return model.value.filter((col) => keywords.every((item) => matchKeyword(col, item)));
  });

  /** 当前选中的列 */
  const activeColumn = computed(() => model.value.find((col) => col.id === activeId.value) ?? null);

  /** 当前选中列在列数组中的索引，未选中时为 -1 */
  const activeIndex = computed(() => model.value.findIndex((col) => col.id === activeId.value));

  /** 当前被阻塞的列类型集合（单例已占用 + 互斥组已占用） */
  const blockedTypes = computed(() => getBlockedColumnTypes(model.value.map((c) => c.type)));

  /** 选中列是否可复制：复制后会产生同类型，若该类型当前被阻塞则不允许 */
  const canCopyActive = computed(
    () => !!activeColumn.value && !blockedTypes.value.has(activeColumn.value.type)
  );

  /** 选中列的配置表单 schema：静态定义在 forms/table-column，实时参数从当前页传入 */
  const columnSchema = computed<FormItemProps[]>(() =>
    getColumnSchema({
      blockedTypes: blockedTypes.value,
      activeType: activeColumn.value?.type,
    })
  );

  /** 列配置表单校验规则（暂无需校验字段） */
  const columnRules = z.object({});

  /** 同步列配置到列数组，保持 id 不变并触发表单更新 */
  function onColumnChange(value: Record<string, any> | undefined) {
    if (!value) return;
    model.value = model.value.map((col) =>
      col.id === activeId.value ? ({ ...col, ...value, id: col.id } as TableColumn) : col
    );
  }

  /** 添加列按钮下拉的完整选项（含 disabled 状态） */
  function allTypeOptions(): {
    value: TableColumnType;
    label: string;
    disabled: boolean;
  }[] {
    return ALL_TYPE_VALUES.map((t) => ({
      value: t,
      label: TABLE_COLUMN_TYPE_LABEL[t],
      disabled: blockedTypes.value.has(t),
    }));
  }

  /** 非禁用的可用类型数 */
  const availableTypes = computed(() => allTypeOptions().filter((o) => !o.disabled).length);

  /** 添加新列并选中 */
  function addColumn(type: TableColumnType) {
    if (
      isColumnTypeBlocked(
        type,
        model.value.map((c) => c.type)
      )
    )
      return;
    const column = createTableColumn(type);
    model.value.push(column);
    activeId.value = column.id;
    addMenuPopover.value?.hide();
    commit();
  }

  /** 选中列 */
  function selectColumn(col: TableColumn) {
    activeId.value = col.id;
  }

  /** 复制列：在当前列后插入同配置的新列并选中 */
  function copyColumn(index: number) {
    if (index < 0) return;
    const source = model.value[index];
    if (!source) return;
    // 复制后会多出一个同类型列：若该类型当前已阻塞（单例占用或互斥组占用）则不允许
    if (
      isColumnTypeBlocked(
        source.type,
        model.value.map((c) => c.type)
      )
    )
      return;
    const column: TableColumn = { ...source, id: generateId('col') };
    model.value.splice(index + 1, 0, column);
    activeId.value = column.id;
    commit();
  }

  /** 删除列：保持选中有效项 */
  function removeColumn(index: number) {
    if (index < 0) return;
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
      console.log('表格列拖拽结束: 类型', event.operation?.source?.type);
      if (event.operation?.source?.type !== 'sortableColumn') return;
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
