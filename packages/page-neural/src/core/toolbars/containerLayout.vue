<script setup lang="ts">
  import {
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignHorizontalJustifyStart,
    AlignHorizontalSpaceAround,
    AlignHorizontalSpaceBetween,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignVerticalJustifyStart,
    ArrowDownUp,
    ArrowLeftRight,
    ArrowRightLeft,
    ArrowUpDown,
    Grid3x3,
    MoveHorizontal,
    Rows3,
    StretchVertical,
    TextWrap,
  } from '@lucide/vue';
  import type { LucideIcon } from '@lucide/vue';
  import { usePageNeuralStore } from '@neural/store';
  import InputNumber from 'primevue/inputnumber';
  import SelectButton from 'primevue/selectbutton';
  import { computed } from 'vue';

  defineOptions({
    name: 'ContainerLayoutToolbar',
  });

  interface Props {
    id?: string;
  }

  const props = defineProps<Props>();

  const pageNeuralStore = usePageNeuralStore();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
  const layoutModel = computed(() => container.value?.props?.layoutModel || {});
  const isActive = computed(() => pageNeuralStore.activeNodeId === props.id);

  /**
   * 更新 layoutModel 中的单个字段
   */
  function updateLayoutField(field: string, value: any) {
    if (!props.id) return;
    const current = layoutModel.value || {};
    pageNeuralStore.updateContainerProps(props.id, {
      layoutModel: { ...current, [field]: value },
    });
  }

  interface SelectOption {
    label: string;
    value: string;
    icon?: LucideIcon;
  }

  // 布局类型
  const layoutTypeOptions: SelectOption[] = [
    { label: 'Flex 布局', value: 'flex', icon: Rows3 },
    { label: 'Grid 布局', value: 'grid', icon: Grid3x3 },
  ];

  // flex 方向
  const flexDirectionOptions: SelectOption[] = [
    { label: '横向', value: 'row', icon: ArrowRightLeft },
    { label: '横向反向', value: 'row-reverse', icon: ArrowLeftRight },
    { label: '纵向', value: 'column', icon: ArrowUpDown },
    { label: '纵向反向', value: 'column-reverse', icon: ArrowDownUp },
  ];

  // 主轴对齐 (justify-content)
  const justifyContentOptions: SelectOption[] = [
    { label: '起始对齐', value: 'flex-start', icon: AlignHorizontalJustifyStart },
    { label: '居中', value: 'center', icon: AlignHorizontalJustifyCenter },
    { label: '末尾对齐', value: 'flex-end', icon: AlignHorizontalJustifyEnd },
    { label: '两端对齐', value: 'space-between', icon: AlignHorizontalSpaceBetween },
    { label: '环绕对齐', value: 'space-around', icon: AlignHorizontalSpaceAround },
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
  <div
    v-if="isActive"
    class="container-layout-toolbar absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-full items-center gap-2 rounded-md border border-gray-200 bg-white p-1.5 shadow-md dark:border-gray-700 dark:bg-gray-800"
    @click.stop
  >
    <!-- 布局类型切换 -->
    <div class="flex items-center gap-1">
      <SelectButton
        :modelValue="layoutModel.type"
        :options="layoutTypeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
        @update:modelValue="(v) => updateLayoutField('type', v)"
      >
        <template #option="{ option }">
          <component :is="option.icon" :size="14" />
        </template>
      </SelectButton>
    </div>

    <div class="h-5 w-px bg-gray-200 dark:bg-gray-700"></div>

    <!-- Flex 属性 -->
    <template v-if="layoutModel.type === 'flex'">
      <!-- 方向 -->
      <div class="flex items-center gap-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">方向</span>
        <SelectButton
          :modelValue="layoutModel.flexDirection"
          :options="flexDirectionOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          @update:modelValue="(v) => updateLayoutField('flexDirection', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" />
          </template>
        </SelectButton>
      </div>

      <!-- 主轴对齐 -->
      <div class="flex items-center gap-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">主轴</span>
        <SelectButton
          :modelValue="layoutModel.justifyContent"
          :options="justifyContentOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          @update:modelValue="(v) => updateLayoutField('justifyContent', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" />
          </template>
        </SelectButton>
      </div>

      <!-- 交叉轴对齐 -->
      <div class="flex items-center gap-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">交叉</span>
        <SelectButton
          :modelValue="layoutModel.alignItems"
          :options="alignItemsOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          @update:modelValue="(v) => updateLayoutField('alignItems', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" />
          </template>
        </SelectButton>
      </div>

      <!-- 换行 -->
      <div class="flex items-center gap-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">换行</span>
        <SelectButton
          :modelValue="layoutModel.flexWrap"
          :options="flexWrapOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          @update:modelValue="(v) => updateLayoutField('flexWrap', v)"
        >
          <template #option="{ option }">
            <component :is="option.icon" :size="14" />
          </template>
        </SelectButton>
      </div>
    </template>

    <!-- Grid 属性 -->
    <template v-else-if="layoutModel.type === 'grid'">
      <div class="flex items-center gap-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">列</span>
        <SelectButton
          :modelValue="layoutModel.gridTemplateColumns"
          :options="gridColumnsOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          @update:modelValue="(v) => updateLayoutField('gridTemplateColumns', v)"
        />
      </div>
    </template>

    <div class="h-5 w-px bg-gray-200 dark:bg-gray-700"></div>

    <!-- 间距 -->
    <div class="flex items-center gap-1">
      <span class="text-xs text-gray-500 dark:text-gray-400">间距</span>
      <InputNumber
        :modelValue="layoutModel.gap"
        size="small"
        :min="0"
        :max="100"
        input-class="!w-14"
        @update:modelValue="(v) => updateLayoutField('gap', v ?? 0)"
      />
      <span class="text-xs text-gray-400">px</span>
    </div>
  </div>
</template>

<style scoped>
  .container-layout-toolbar :deep(.p-selectbutton) {
    gap: 0;
  }
  .container-layout-toolbar :deep(.p-togglebutton) {
    padding: 0.25rem 0.5rem;
  }
</style>
