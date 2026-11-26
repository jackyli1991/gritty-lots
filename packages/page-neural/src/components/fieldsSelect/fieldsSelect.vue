<script setup lang="ts">
  import { useDragDropMonitor } from '@dnd-kit/vue';
  import { isSortable } from '@dnd-kit/vue/sortable';
  import SortableItem from '@neural/dnd/components/sortableItem.vue';
  import type { Field, CustomField } from '@neural/types/table';
  import { computedAsync } from '@vueuse/core';
  import { isFunction } from 'lodash-es';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Tag from 'primevue/tag';
  import type { TreeNode } from 'primevue/treenode';
  import TreeSelect from 'primevue/treeselect';
  import { computed, nextTick, ref, watch } from 'vue';

  import NeuralIcon from '../icon';

  defineOptions({ inheritAttrs: false });

  type SelectionMode = 'single' | 'multiple' | 'checkbox';

  /** checkbox 模式下 TreeSelect 的选中状态结构 */
  interface CheckboxState {
    checked: boolean;
    partialChecked: boolean;
  }

  interface Props {
    /** 真实嵌套数据对象，或返回该对象（可异步）的函数，用于解析字段层级 */
    data?:
      | Record<string, unknown>
      | (() => Record<string, unknown> | Promise<Record<string, unknown>>);
    /** 选择模式，与 TreeSelect 保持一致 */
    selectionMode?: SelectionMode;
    /** 是否允许自定义添加选项 */
    customOption?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: undefined,
    selectionMode: 'single',
    customOption: false,
  });

  /** 兼容对象与函数（支持异步）两种 data 传参形式 */
  const resolvedData = computedAsync<Record<string, unknown>>(async () => {
    const raw = props.data;
    if (isFunction(raw)) return await raw();
    return raw ?? {};
  }, {});

  const modelValue = defineModel<Field[]>({ default: () => [] });

  /** 初始进入或父组件更新时，若 v-model 传入的是字符串则自动归一化为数组 */
  watch(
    () => modelValue.value as unknown,
    (value) => {
      if (typeof value === 'string') {
        modelValue.value = [value];
      }
    },
    { immediate: true, once: true }
  );

  /** 归一化后的已选值列表（兼容初始字符串） */
  const selectedValues = computed<Field[]>(() => {
    const value = modelValue.value;
    if (typeof value === 'string') return value ? [value] : [];
    return value ?? [];
  });

  function isCustomValue(item: Field): item is CustomField {
    return typeof item === 'object' && item !== null && item.type === 'custom';
  }

  /** 已选值的展示文本 */
  function getItemText(item: Field): string {
    return isCustomValue(item) ? item.value : item;
  }

  /** 已选值的唯一 key */
  function getItemKey(item: Field): string {
    return isCustomValue(item) ? `custom:${item.value}` : `field:${item}`;
  }

  /** 字段路径连接符；字段名含 "." 时存在撞 key 的边界情况，按约定忽略 */
  const PATH_SEPARATOR = '.';

  function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /** 递归解析数据对象：数组整体作为一个字段，对象继续展开子节点 */
  function buildNodes(data: Record<string, unknown>, parentPath = ''): TreeNode[] {
    return Object.entries(data).map(([field, value]) => {
      const path = parentPath ? `${parentPath}${PATH_SEPARATOR}${field}` : field;
      const children = isPlainObject(value) ? buildNodes(value, path) : [];

      return {
        key: path,
        label: field,
        ...(children.length ? { children } : {}),
      };
    });
  }

  /** 树形选项：所有层级均可选中 */
  const options = computed<TreeNode[]>(() => buildNodes(resolvedData.value));

  /** 树中存在的字段路径集合，用于区分树选项与自定义值 */
  const optionKeys = computed(() => {
    const keys = new Set<string>();

    const walk = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        keys.add(String(node.key));
        if (node.children?.length) walk(node.children);
      }
    };

    walk(options.value);

    return keys;
  });

  /** 是否为树中存在的字段路径（用于区分 Tag 与普通 span） */
  function isTreeValue(item: Field): item is string {
    return typeof item === 'string' && optionKeys.value.has(item);
  }

  /** modelValue → TreeSelect 需要的 selectionKeys（仅树选项字符串参与） */
  const selectionKeys = computed<Record<string, boolean | CheckboxState>>(() => {
    const keys: Record<string, boolean | CheckboxState> = {};

    for (const item of selectedValues.value) {
      if (typeof item !== 'string') continue;

      keys[item] =
        props.selectionMode === 'checkbox' ? { checked: true, partialChecked: false } : true;
    }

    return keys;
  });

  /** TreeSelect 的 selectionKeys → 已选值，保留自定义项 */
  function onSelectionChange(keys: Record<string, unknown> | null) {
    const treeValues: string[] = [];

    for (const [key, state] of Object.entries(keys ?? {})) {
      if (state === true) treeValues.push(key);
      else if (state && typeof state === 'object' && (state as CheckboxState).checked)
        treeValues.push(key);
    }

    modelValue.value = [...selectedValues.value.filter(isCustomValue), ...treeValues];
  }

  /** 是否展示自定义输入框 */
  const adding = ref(false);

  /** 自定义输入内容 */
  const customInput = ref('');

  const inputRef = ref<{ $el?: HTMLInputElement } | null>(null);

  /** 点击「添加」：展示输入框并自动聚焦 */
  async function startAdd() {
    adding.value = true;
    await nextTick();
    inputRef.value?.$el?.focus();
  }

  /** 回车确认：自定义值以 { type: 'custom', value } 追加，自动去重去空白 */
  function confirmCustom() {
    const value = customInput.value.trim();
    if (!value) return;

    if (!selectedValues.value.some((item) => getItemText(item) === value)) {
      modelValue.value = [...selectedValues.value, { type: 'custom', value }];
    }

    customInput.value = '';
  }

  /** 按索引删除单个已选值 */
  function removeValue(index: number) {
    modelValue.value = selectedValues.value.filter((_, itemIndex) => itemIndex !== index);
  }

  /** 已选值拖拽排序组标识 */
  const SELECTED_SORT_GROUP = 'fields-select-values';

  /** 拖拽结束后按索引重排已选值数组 */
  useDragDropMonitor({
    onDragEnd(event) {
      if (event.operation?.source?.type !== 'sortable') return;
      if (event.canceled) return;
      const { source } = event.operation;
      if (!source || !isSortable(source) || source.group !== SELECTED_SORT_GROUP) return;
      const from = source.initialIndex;
      const to = source.index;
      if (from === to) return;
      const list = [...selectedValues.value];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      modelValue.value = list;
    },
  });
</script>

<template>
  <TreeSelect
    :modelValue="selectionKeys"
    :options="options"
    :selection-mode="selectionMode"
    v-bind="$attrs"
    :formControl="{ novalidate: true }"
    @update:modelValue="onSelectionChange"
  >
    <!-- 回显：树选项用 Tag，自定义值用普通 span，均支持单个删除 -->
    <template #value="{ placeholder }">
      <div v-if="selectedValues.length" class="flex flex-wrap items-center gap-1">
        <SortableItem
          v-for="(item, index) in selectedValues"
          :key="getItemKey(item)"
          :id="getItemKey(item)"
          :index="index"
          :group="SELECTED_SORT_GROUP"
          :data="{ name: isTreeValue(item) ? item : getItemText(item) }"
          class="inline-flex cursor-grab"
        >
          <Tag v-if="isTreeValue(item)" severity="secondary" class="max-w-full">
            <span class="inline-flex min-w-0 items-center gap-1">
              <span class="truncate">{{ item }}</span>
              <NeuralIcon
                name="X"
                :size="12"
                :label="`移除 ${item}`"
                class="shrink-0"
                @click.stop="removeValue(index)"
              />
            </span>
          </Tag>
          <span
            v-else
            class="inline-flex min-w-0 items-center gap-1 text-sm px-1.5 py-0.5 rounded-md text-gray-700 dark:text-gray-200"
          >
            <span class="truncate">{{ getItemText(item) }}</span>
            <NeuralIcon
              name="X"
              :size="12"
              :label="`移除 ${getItemText(item)}`"
              class="shrink-0"
              @click.stop="removeValue(index)"
            />
          </span>
        </SortableItem>
      </div>
      <span v-else class="text-gray-400 dark:text-gray-500">{{ placeholder }}</span>
    </template>

    <!-- 自定义添加：按钮 → 输入框（自动聚焦）→ 回车写入 -->
    <template v-if="customOption" #footer>
      <div class="mt-1 flex items-center gap-2 border-t border-gray-200 p-2 dark:border-gray-700">
        <Button v-if="!adding" text size="small" @click="startAdd">
          <NeuralIcon name="Plus" :size="14" />
          <span>添加</span>
        </Button>
        <InputText
          v-else
          ref="inputRef"
          v-model="customInput"
          size="small"
          placeholder="输入自定义选项后回车"
          class="min-w-0 flex-1"
          :formControl="{ novalidate: true }"
          @keydown.enter.stop.prevent="confirmCustom"
          @blur="adding = false"
        />
      </div>
    </template>
  </TreeSelect>
</template>
