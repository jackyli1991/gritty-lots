<script setup lang="ts" generic="T = string | number | boolean">
  import {
    RiAddLine,
    RiArrowDownSLine,
    RiCloseLine,
    RiLoader4Line,
    RiSearchLine,
  } from '@remixicon/vue';
  import { useVModel } from '@vueuse/core';
  import {
    SelectContent as RSelectContent,
    SelectGroup,
    SelectIcon,
    SelectItem as RSelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectLabel as RSelectLabel,
    SelectPortal,
    SelectRoot,
    SelectScrollDownButton as RSelectScrollDownButton,
    SelectScrollUpButton as RSelectScrollUpButton,
    SelectTrigger as RSelectTrigger,
    SelectValue as RSelectValue,
    SelectViewport,
  } from 'reka-ui';
  import type { HTMLAttributes } from 'vue';
  import { computed, nextTick, ref, useSlots, watch } from 'vue';

  import type { SelectFieldNames, SelectMode, SelectOption, SelectStatus } from '.';
  import { selectTriggerVariants } from '.';
  import { cn } from '../../../lib/utils';

  defineOptions({ name: 'GSelect' });

  interface Props {
    /** 当前选中值（v-model:value） */
    value?: T | T[];
    /** 默认选中值（非受控） */
    defaultValue?: T | T[];
    /** 模式：multiple=多选，tags=可创建新标签 */
    mode?: SelectMode;
    /** 选项数据 */
    options?: SelectOption[];
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否允许清除 */
    allowClear?: boolean;
    /** 是否支持搜索（tags 模式默认开启） */
    showSearch?: boolean;
    /** 是否显示下拉箭头 */
    showArrow?: boolean;
    /** 加载中状态 */
    loading?: boolean;
    /** 控件尺寸 */
    size?: 'mini' | 'xs' | 'sm' | 'default' | 'lg';
    /** 校验状态 */
    status?: SelectStatus;
    /** 占位文本 */
    placeholder?: string;
    /** 是否有边框 */
    bordered?: boolean;
    /** 前缀图标/文本 */
    prefix?: string;
    /** 多选模式最大标签数 */
    maxTagCount?: number | 'responsive';
    /** 自定义选项字段名 */
    fieldNames?: SelectFieldNames;
    /** 控制下拉展开（v-model:open） */
    open?: boolean;
    /** 默认展开（非受控） */
    defaultOpen?: boolean;
    /** 无数据时显示内容 */
    notFoundContent?: string;
    /** 过滤函数，true=默认过滤，false=不过滤 */
    filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
    /** 过滤依据字段 */
    optionFilterProp?: string;
    /** 下拉面板自定义类名 */
    popupClass?: HTMLAttributes['class'];
    /** 自定义类名 */
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: undefined,
    disabled: false,
    allowClear: false,
    showSearch: false,
    showArrow: true,
    loading: false,
    size: 'default',
    status: 'default',
    bordered: true,
    maxTagCount: undefined,
    notFoundContent: '暂无数据',
    filterOption: true,
    optionFilterProp: 'value',
  });

  const emit = defineEmits<{
    'update:value': [value: T | T[]];
    'update:open': [open: boolean];
    change: [value: T | T[], option: SelectOption | SelectOption[]];
    select: [value: T, option: SelectOption];
    deselect: [value: T, option: SelectOption];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
    search: [value: string];
    dropdownVisibleChange: [open: boolean];
  }>();

  const slots = useSlots();
  const triggerRef = ref<HTMLElement | null>(null);
  const searchRef = ref<HTMLInputElement | null>(null);

  const isMultiple = computed(() => props.mode === 'multiple' || props.mode === 'tags');
  const isTags = computed(() => props.mode === 'tags');
  const effectiveShowSearch = computed(() => props.showSearch || isTags.value);
  const isInternalChange = ref(false);

  // ---- 值管理 ----
  const innerValue = useVModel(props, 'value', emit, {
    passive: true,
    defaultValue: props.defaultValue ?? (isMultiple.value ? ([] as T[]) : undefined),
    eventName: 'update:value',
  });

  // ---- 字段映射 ----
  const resolvedFieldNames = computed<SelectFieldNames>(() => ({
    label: 'label',
    value: 'value',
    disabled: 'disabled',
    options: 'options',
    ...props.fieldNames,
  }));

  // ---- 标准化选项 ----
  interface NormalizedOption {
    label: string;
    value: T;
    disabled: boolean;
    raw: SelectOption;
  }
  interface NormalizedGroup {
    label: string;
    options: NormalizedOption[];
  }

  const groupedOptions = computed<NormalizedGroup[]>(() => {
    const { label: lk, value: vk, disabled: dk, options: ok } = resolvedFieldNames.value;
    const groups: NormalizedGroup[] = [];
    for (const raw of props.options ?? []) {
      const children = raw[ok];
      if (Array.isArray(children)) {
        groups.push({
          label: String(raw[lk] ?? ''),
          options: children.map((child: SelectOption) => ({
            label: String(child[lk] ?? ''),
            value: child[vk] as T,
            disabled: !!child[dk],
            raw: child,
          })),
        });
      } else {
        const last = groups[groups.length - 1];
        const item: NormalizedOption = {
          label: String(raw[lk] ?? ''),
          value: raw[vk] as T,
          disabled: !!raw[dk],
          raw,
        };
        if (last && last.label === '') {
          last.options.push(item);
        } else {
          groups.push({ label: '', options: [item] });
        }
      }
    }
    return groups;
  });

  const flatOptions = computed<NormalizedOption[]>(() =>
    groupedOptions.value.flatMap((g) => g.options)
  );

  // ---- tags 模式：用户创建的新标签 ----
  const createdTags = ref<NormalizedOption[]>([]);
  watch(
    () => props.options,
    () => {
      createdTags.value = createdTags.value.filter(
        (t) => !flatOptions.value.some((o) => o.value === t.value)
      );
    }
  );

  const allFlatOptions = computed<NormalizedOption[]>(() => [
    ...createdTags.value,
    ...flatOptions.value,
  ]);

  function findOptionByValue(val: T): NormalizedOption | undefined {
    return allFlatOptions.value.find((o) => o.value === val);
  }

  // ---- 搜索 ----
  const searchText = ref('');

  const filterFn = computed<((input: string, option: SelectOption) => boolean) | null>(() => {
    if (props.filterOption === false) return null;
    if (typeof props.filterOption === 'function') return props.filterOption;
    const prop = props.optionFilterProp;
    return (input: string, option: SelectOption) => {
      const field = option[prop];
      if (field == null) return false;
      return String(field).toLowerCase().includes(input.toLowerCase());
    };
  });

  const filteredGroups = computed<NormalizedGroup[]>(() => {
    const base: NormalizedGroup[] =
      isTags.value && createdTags.value.length > 0
        ? [{ label: '', options: createdTags.value }, ...groupedOptions.value]
        : groupedOptions.value;

    if (!filterFn.value || !searchText.value) return base;

    const fn = filterFn.value;
    const input = searchText.value;
    const result: NormalizedGroup[] = [];
    for (const g of base) {
      const matched = g.options.filter((o) => fn(input, o.raw));
      if (matched.length) result.push({ label: g.label, options: matched });
    }
    return result;
  });

  const showCreateOption = computed(() => {
    if (!isTags.value || !searchText.value) return false;
    return !allFlatOptions.value.some((o) => String(o.value) === String(searchText.value));
  });

  function createTag() {
    const val = searchText.value as T;
    if (!val) return;
    const newOpt: NormalizedOption = {
      label: String(val),
      value: val,
      disabled: false,
      raw: { label: String(val), value: val },
    };
    createdTags.value.push(newOpt);
    if (isMultiple.value) {
      const arr = Array.isArray(innerValue.value) ? [...(innerValue.value as T[])] : [];
      if (!arr.includes(val)) arr.push(val);
      applyValueChange(arr);
    }
    searchText.value = '';
    emit('search', '');
  }

  function onSearchInput(event: Event) {
    searchText.value = (event.target as HTMLInputElement).value;
    emit('search', searchText.value);
  }

  function onSearchEnter() {
    if (isTags.value && showCreateOption.value) createTag();
  }

  // ---- 展开状态 ----
  const isOpen = useVModel(props, 'open', emit, {
    passive: true,
    defaultValue: props.defaultOpen ?? false,
    eventName: 'update:open',
  });

  function onOpenChange(open: boolean) {
    isOpen.value = open;
    emit('dropdownVisibleChange', open);
    if (!open) {
      searchText.value = '';
      emit('search', '');
    } else if (effectiveShowSearch.value) {
      nextTick(() => searchRef.value?.focus());
    }
  }

  // ---- 值变更处理 ----
  function applyValueChange(newVal: T | T[]) {
    const oldVal = innerValue.value;
    innerValue.value = newVal;

    // change 事件
    if (isMultiple.value) {
      const arr = Array.isArray(newVal) ? newVal : [];
      emit(
        'change',
        newVal,
        arr.map((v) => findOptionByValue(v)?.raw ?? { value: v })
      );

      // select / deselect
      const oldArr = Array.isArray(oldVal) ? oldVal : [];
      const oldSet = new Set(oldArr.map((v) => String(v)));
      const newSet = new Set(arr.map((v) => String(v)));
      for (const v of arr) {
        if (!oldSet.has(String(v))) {
          emit('select', v, findOptionByValue(v)?.raw ?? { value: v });
        }
      }
      for (const v of oldArr) {
        if (!newSet.has(String(v))) {
          emit('deselect', v, findOptionByValue(v)?.raw ?? { value: v });
        }
      }
    } else {
      emit('change', newVal, findOptionByValue(newVal as T)?.raw ?? { value: newVal });
      emit('select', newVal as T, findOptionByValue(newVal as T)?.raw ?? { value: newVal });
    }
  }

  function onValueChange(val: T | T[]) {
    if (isInternalChange.value) {
      isInternalChange.value = false;
      return;
    }
    applyValueChange(val);
  }

  // ---- 选中项展示 ----
  const selectedOptions = computed<NormalizedOption[]>(() => {
    if (isMultiple.value) {
      const arr = Array.isArray(innerValue.value) ? (innerValue.value as T[]) : [];
      return arr.map((v) => findOptionByValue(v)).filter((o): o is NormalizedOption => !!o);
    }
    const opt = findOptionByValue(innerValue.value as T);
    return opt ? [opt] : [];
  });

  const hasValue = computed(() => {
    if (isMultiple.value) {
      return Array.isArray(innerValue.value) && innerValue.value.length > 0;
    }
    return innerValue.value !== undefined && innerValue.value !== null && innerValue.value !== '';
  });

  const visibleTags = computed<NormalizedOption[]>(() => {
    if (
      !isMultiple.value ||
      props.maxTagCount === undefined ||
      props.maxTagCount === 'responsive'
    ) {
      return selectedOptions.value;
    }
    return selectedOptions.value.slice(0, props.maxTagCount as number);
  });

  const overflowCount = computed(() => {
    if (
      !isMultiple.value ||
      props.maxTagCount === undefined ||
      props.maxTagCount === 'responsive'
    ) {
      return 0;
    }
    return Math.max(0, selectedOptions.value.length - (props.maxTagCount as number));
  });

  // ---- 清除 / 移除标签 ----
  function clearValue(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    isInternalChange.value = true;
    const cleared = isMultiple.value ? ([] as T[]) : (undefined as unknown as T);
    if (isMultiple.value) {
      const opts = selectedOptions.value.map((o) => o.raw);
      innerValue.value = cleared;
      emit('change', cleared, opts);
    } else {
      const opt = selectedOptions.value[0]?.raw;
      innerValue.value = cleared;
      emit('change', cleared, opt ?? { value: cleared });
    }
    nextTick(() => {
      isOpen.value = false;
      getTriggerEl()?.blur();
    });
  }

  function removeTag(val: T, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!isMultiple.value) return;
    const arr = Array.isArray(innerValue.value) ? [...(innerValue.value as T[])] : [];
    const idx = arr.findIndex((v) => String(v) === String(val));
    if (idx >= 0) {
      isInternalChange.value = true;
      const [removed] = arr.splice(idx, 1);
      const opt = findOptionByValue(removed);
      innerValue.value = arr as T[];
      emit(
        'change',
        arr as T[],
        selectedOptions.value.map((o) => o.raw)
      );
      emit('deselect', removed, opt?.raw ?? { value: removed });
      nextTick(() => {
        isOpen.value = false;
        getTriggerEl()?.blur();
      });
    }
  }

  // ---- 样式 ----
  const triggerClass = computed(() =>
    cn(
      selectTriggerVariants({ size: props.size }),
      isMultiple.value ? 'py-0.5 min-h-8' : `h-control-${props.size}`,
      !props.bordered && 'border-0 shadow-none',
      props.status === 'error' &&
        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20 data-[state=open]:border-destructive data-[state=open]:ring-destructive/20',
      props.status === 'warning' &&
        'border-warning focus-visible:border-warning focus-visible:ring-warning/20 focus-within:border-warning focus-within:ring-warning/20 data-[state=open]:border-warning data-[state=open]:ring-warning/20',
      props.status === 'default' &&
        'focus-visible:border-primary focus-visible:ring-primary/20 focus-within:border-primary focus-within:ring-primary/20 data-[state=open]:border-primary data-[state=open]:ring-primary/20',
      props.disabled && 'opacity-disabled',
      props.class
    )
  );

  const triggerMinHeight = computed(() =>
    isMultiple.value ? { minHeight: `var(--gritty-design-control-${props.size})` } : undefined
  );

  // ---- 焦点 / 失焦 ----
  function getTriggerEl(): HTMLElement | null {
    const el = triggerRef.value;
    if (!el) return null;
    if (el instanceof HTMLElement) return el;
    if ('$el' in el && el.$el instanceof HTMLElement) return el.$el;
    return null;
  }
  function onBlur(event: FocusEvent) {
    emit('blur', event);
  }
  function onFocus(event: FocusEvent) {
    emit('focus', event);
  }

  // ---- 方法 ----
  function focus() {
    getTriggerEl()?.focus();
  }
  function blur() {
    getTriggerEl()?.blur();
  }
  defineExpose({ focus, blur });
</script>

<template>
  <SelectRoot
    data-slot="select"
    :model-value="innerValue"
    :multiple="isMultiple"
    :disabled="disabled"
    :open="isOpen"
    :default-value="defaultValue"
    @update:model-value="onValueChange"
    @update:open="onOpenChange"
  >
    <!-- 触发器 -->
    <div data-slot="select-wrapper" class="relative inline-flex w-full">
      <RSelectTrigger
        ref="triggerRef"
        data-slot="select-trigger"
        :data-size="size"
        :style="triggerMinHeight"
        :class="triggerClass"
        @blur="onBlur"
        @focus="onFocus"
      >
        <!-- 前缀 -->
        <span
          v-if="prefix || slots.prefix"
          data-slot="select-prefix"
          class="inline-flex shrink-0 items-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
        >
          <slot name="prefix">{{ prefix }}</slot>
        </span>

        <!-- 单选：SelectValue -->
        <RSelectValue
          v-if="!isMultiple"
          :placeholder="placeholder"
          class="min-w-0 flex-1 truncate text-left"
        />
        <!-- 多选：标签展示 -->
        <template v-else>
          <div v-if="hasValue" class="flex flex-wrap items-center gap-1 min-w-0 flex-1">
            <span
              v-for="tag in visibleTags"
              :key="String(tag.value)"
              data-slot="select-tag"
              class="inline-flex items-center gap-0.5 rounded-sm bg-accent px-1.5 py-0.5 text-xs text-accent-foreground"
            >
              <span class="max-w-32 truncate">{{ tag.label }}</span>
              <span
                v-if="!disabled"
                role="button"
                tabindex="-1"
                aria-label="remove"
                class="inline-flex cursor-pointer items-center justify-center opacity-60 hover:opacity-100"
                @click.stop.prevent="removeTag(tag.value, $event)"
              >
                <RiCloseLine class="size-3" />
              </span>
            </span>
            <span
              v-if="overflowCount > 0"
              data-slot="select-tag-overflow"
              class="inline-flex items-center px-1 text-xs text-muted-foreground"
            >
              +{{ overflowCount }}
            </span>
          </div>
          <span v-else class="text-muted-foreground text-sm">{{ placeholder }}</span>
        </template>

        <!-- 箭头 / 加载 -->
        <SelectIcon v-if="showArrow" as-child>
          <slot v-if="loading" name="loadingIcon">
            <RiLoader4Line class="size-4 animate-spin opacity-50" />
          </slot>
          <slot v-else name="suffixIcon">
            <RiArrowDownSLine class="size-4 opacity-50" />
          </slot>
        </SelectIcon>
      </RSelectTrigger>

      <!-- 清除按钮（在 trigger 外部，避免 button 嵌套问题） -->
      <span
        v-if="allowClear && hasValue && !disabled"
        role="button"
        tabindex="-1"
        aria-label="clear"
        data-slot="select-clear"
        class="absolute right-6 top-1/2 z-10 inline-flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm bg-background opacity-50 hover:opacity-100 transition-opacity"
        @click.stop.prevent="clearValue"
      >
        <slot name="clearIcon">
          <RiCloseLine class="size-4" />
        </slot>
      </span>
    </div>

    <!-- 下拉面板 -->
    <SelectPortal>
      <RSelectContent
        data-slot="select-content"
        position="popper"
        side="bottom"
        :class="
          cn(
            'bg-popover text-popover-foreground data-[state=open]:slide-in data-[state=closed]:slide-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--reka-select-content-available-height) min-w-[8rem] min-w-(--reka-select-trigger-width) overflow-x-hidden overflow-y-auto rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            popupClass
          )
        "
      >
        <RSelectScrollUpButton />
        <!-- 搜索框 -->
        <div
          v-if="effectiveShowSearch"
          data-slot="select-search"
          class="sticky top-0 z-10 border-b border-border bg-popover p-2"
        >
          <div class="relative">
            <RiSearchLine
              class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref="searchRef"
              :value="searchText"
              class="h-8 w-full rounded-md border border-input bg-transparent pl-7 pr-2 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
              placeholder="搜索..."
              @input="onSearchInput"
              @keydown.enter.prevent="onSearchEnter"
              @keydown.esc.prevent="
                searchText = '';
                emit('search', '');
              "
            />
          </div>
        </div>
        <SelectViewport class="p-1 min-w-(--reka-select-trigger-width)">
          <template v-if="filteredGroups.length || showCreateOption">
            <template v-for="(g, gi) in filteredGroups" :key="gi">
              <SelectGroup v-if="g.label">
                <RSelectLabel class="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  {{ g.label }}
                </RSelectLabel>
                <RSelectItem
                  v-for="opt in g.options"
                  :key="String(opt.value)"
                  :value="opt.value"
                  :disabled="opt.disabled"
                  data-slot="select-item"
                  class="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span class="absolute right-2 flex size-3.5 items-center justify-center">
                    <SelectItemIndicator>
                      <slot name="itemIcon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </slot>
                    </SelectItemIndicator>
                  </span>
                  <SelectItemText>{{ opt.label }}</SelectItemText>
                </RSelectItem>
              </SelectGroup>
              <template v-else>
                <RSelectItem
                  v-for="opt in g.options"
                  :key="String(opt.value)"
                  :value="opt.value"
                  :disabled="opt.disabled"
                  data-slot="select-item"
                  class="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span class="absolute right-2 flex size-3.5 items-center justify-center">
                    <SelectItemIndicator>
                      <slot name="itemIcon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </slot>
                    </SelectItemIndicator>
                  </span>
                  <SelectItemText>{{ opt.label }}</SelectItemText>
                </RSelectItem>
              </template>
            </template>

            <!-- 创建新标签（tags 模式） -->
            <div
              v-if="showCreateOption"
              data-slot="select-create"
              class="border-t border-border pt-1"
            >
              <button
                type="button"
                class="text-primary hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                @click="createTag"
              >
                <RiAddLine class="size-4" />
                创建"{{ searchText }}"
              </button>
            </div>
          </template>

          <!-- 无数据 -->
          <div
            v-else
            data-slot="select-not-found"
            class="text-muted-foreground py-6 text-center text-sm"
          >
            <slot name="notFoundContent">{{ notFoundContent }}</slot>
          </div>
        </SelectViewport>
        <RSelectScrollDownButton />
      </RSelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
