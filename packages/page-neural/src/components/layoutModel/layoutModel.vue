<script lang="ts" setup>
  import {
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignHorizontalJustifyStart,
    AlignHorizontalSpaceAround,
    AlignHorizontalSpaceBetween,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignVerticalJustifyStart,
    ArrowRightLeft,
    ArrowUpDown,
    Grid3x3,
    MoveHorizontal,
    Rows3,
    StretchVertical,
    TextWrap,
  } from '@lucide/vue';
  import type { LucideIcon } from '@lucide/vue';
  import InputNumber from 'primevue/inputnumber';
  import SelectButton from 'primevue/selectbutton';
  import vTooltip from 'primevue/tooltip';
  import { computed, provide } from 'vue';

  defineOptions({
    name: 'LayoutModel',
  });

  /** 布局模型完整数据结构 */
  interface LayoutModelValue {
    type: 'flex' | 'grid'; // 布局类型
    flexDirection: string; // flex 主轴方向
    justifyContent: string; // flex 主轴对齐
    alignItems: string; // flex 交叉轴对齐
    flexWrap: string; // flex 换行方式
    gap: number; // 子项间距（px）
    gridTemplateColumns: string; // grid 列模板
    gridTemplateRows: string; // grid 行模板
  }

  // 内部控件同属一个布局字段而非独立表单项，需屏蔽外层 FormField 注入的表单上下文：
  // 否则 ToggleButton 的 d_value 会被 FormField 的字段值（布局对象）覆写，导致选中态丢失。
  // SelectButton 不会把 formControl 透传给内部 ToggleButton，故在此统一提供 novalidate 上下文。
  provide('$pcFormField', { formControl: { novalidate: true } });

  /** v-model 绑定，带默认值 */
  const model = defineModel<LayoutModelValue>({
    default: () => ({
      type: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
      gap: 0,
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto',
    }),
  });

  /** 更新 layoutModel 中的单个字段（整体替换对象以触发 v-model 更新） */
  function updateLayoutField(field: keyof LayoutModelValue, value: any) {
    model.value = { ...model.value, [field]: value } as LayoutModelValue;
  }

  /** SelectButton 选项结构 */
  interface SelectOption {
    label: string;
    value: string;
    icon?: LucideIcon;
  }

  // 布局类型
  const layoutTypeOptions: SelectOption[] = [
    { label: 'Flex', value: 'flex', icon: Rows3 },
    { label: 'Grid', value: 'grid', icon: Grid3x3 },
  ];

  // flex 方向
  const flexDirectionOptions: SelectOption[] = [
    { label: '横向', value: 'row', icon: ArrowRightLeft },
    // { label: '横向反向', value: 'row-reverse', icon: ArrowLeftRight },
    { label: '纵向', value: 'column', icon: ArrowUpDown },
    // { label: '纵向反向', value: 'column-reverse', icon: ArrowDownUp },
  ];

  /** 选项 tooltip 文案：选项名称 + 原始值，如「横向 (row)」 */
  const optionTip = (option: SelectOption) => `${option.label} (${option.value})`;

  // 主轴对齐 (justify-content)
  const justifyContentOptions: SelectOption[] = [
    { label: '起始对齐', value: 'flex-start', icon: AlignHorizontalJustifyStart },
    { label: '居中', value: 'center', icon: AlignHorizontalJustifyCenter },
    { label: '末尾对齐', value: 'flex-end', icon: AlignHorizontalJustifyEnd },
    { label: '两端对齐', value: 'space-between', icon: AlignHorizontalSpaceBetween },
    { label: '环绕对齐', value: 'space-around', icon: AlignHorizontalSpaceAround },
    { label: '平均对齐', value: 'space-evenly', icon: AlignHorizontalSpaceAround },
  ];

  // 交叉轴对齐 (align-items)
  const alignItemsOptions: SelectOption[] = [
    { label: '起始对齐', value: 'flex-start', icon: AlignVerticalJustifyStart },
    { label: '居中', value: 'center', icon: AlignVerticalJustifyCenter },
    { label: '末尾对齐', value: 'flex-end', icon: AlignVerticalJustifyEnd },
    { label: '拉伸', value: 'stretch', icon: StretchVertical },
  ];

  // flex 换行
  const flexWrapOptions: SelectOption[] = [
    { label: '不换行', value: 'nowrap', icon: MoveHorizontal },
    { label: '换行', value: 'wrap', icon: TextWrap },
  ];

  // grid 列模板预设
  const gridColumnsOptions: SelectOption[] = [
    { label: '1 列', value: '1fr' },
    { label: '2 列', value: '1fr 1fr' },
    { label: '3 列', value: '1fr 1fr 1fr' },
    { label: '4 列', value: '1fr 1fr 1fr 1fr' },
    { label: '自适应', value: 'repeat(auto-fill, minmax(120px, 1fr))' },
  ];
</script>

<template>
  <div class="layout-model grid grid-cols-2 gap-x-4 gap-y-2 w-full text-nowrap">
    <!-- 布局类型切换 -->
    <div class="flex items-center gap-1 col-span-1">
      <span class="text-xs text-gray-500 dark:text-gray-400">布局</span>
      <SelectButton
        :modelValue="model.type"
        :options="layoutTypeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
        @update:modelValue="(v) => updateLayoutField('type', v)"
      >
        <template #option="{ option }">
          <span v-tooltip.top="optionTip(option)" class="flex items-center gap-1">
            <component :is="option.icon" :size="14" />
            <span class="text-xs">{{ option.label }}</span>
          </span>
        </template>
      </SelectButton>
    </div>

    <!-- 间距 -->
    <div class="flex items-center gap-1 col-span-1">
      <span class="text-xs text-gray-500 dark:text-gray-400 text-nowrap">间距</span>
      <InputNumber
        :modelValue="model.gap"
        v-tooltip.top="'间距：' + model.gap + 'px'"
        size="small"
        :min="0"
        :max="100"
        suffix="px"
        showButtons
        fluid
        @update:modelValue="(v) => updateLayoutField('gap', v ?? 0)"
      />
    </div>

    <!-- Flex 属性 -->
    <template v-if="model.type === 'flex'">
      <!-- 方向 -->
      <div class="flex items-center gap-1 col-span-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">方向</span>
        <SelectButton
          :modelValue="model.flexDirection"
          :options="flexDirectionOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          fluid
          @update:modelValue="(v) => updateLayoutField('flexDirection', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" v-tooltip.top="optionTip(option)" />
          </template>
        </SelectButton>
      </div>

      <!-- 换行 -->
      <div class="flex items-center gap-1 col-span-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">换行</span>
        <SelectButton
          :modelValue="model.flexWrap"
          :options="flexWrapOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          fluid
          @update:modelValue="(v) => updateLayoutField('flexWrap', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" v-tooltip.top="optionTip(option)" />
          </template>
        </SelectButton>
      </div>

      <!-- 主轴对齐 -->
      <div class="flex items-center gap-1 col-span-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">主轴</span>
        <SelectButton
          :modelValue="model.justifyContent"
          :options="justifyContentOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          fluid
          @update:modelValue="(v) => updateLayoutField('justifyContent', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" v-tooltip.top="optionTip(option)" />
          </template>
        </SelectButton>
      </div>

      <!-- 交叉轴对齐 -->
      <div class="flex items-center gap-1 col-span-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">交叉</span>
        <SelectButton
          :modelValue="model.alignItems"
          :options="alignItemsOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          fluid
          @update:modelValue="(v) => updateLayoutField('alignItems', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" v-tooltip.top="optionTip(option)" />
          </template>
        </SelectButton>
      </div>
    </template>

    <!-- Grid 属性 -->
    <template v-else-if="model.type === 'grid'">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 w-full">
        <div class="flex items-center gap-1">
          <span class="text-xs text-gray-500 dark:text-gray-400">列数</span>
          <SelectButton
            :modelValue="model.gridTemplateColumns"
            :options="gridColumnsOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            size="small"
            @update:modelValue="(v) => updateLayoutField('gridTemplateColumns', v)"
          >
            <template #option="{ option }">
              <span v-tooltip.top="optionTip(option)">{{ option.label }}</span>
            </template>
          </SelectButton>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .layout-model :deep(.p-selectbutton) {
    gap: 0;
  }
  .layout-model :deep(.p-togglebutton) {
    padding: 0.25rem 0.5rem;
  }
</style>
