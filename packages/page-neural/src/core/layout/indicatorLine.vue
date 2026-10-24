<script setup lang="ts">
  import type { LayoutPanelNode } from '@neural/types';
  import Tag from 'primevue/tag';
  import { computed } from 'vue';

  // 悬停面板时沿分隔方向贯穿面板的尺寸指示线：两端外指箭头 + 红色细线 + 中央尺寸标签
  const props = defineProps<{
    isHorizontal: boolean; // 方向：true 为水平线，false 为竖直线
    sizeValue?: number; // 面板尺寸值
    useUnit?: LayoutPanelNode['useUnit']; // 面板尺寸单位
  }>();

  const emit = defineEmits<{
    toggleUnit: []; // 点击单位标签，由父组件循环切换单位
  }>();

  // 单位对应的标签样式：px 为 success，% 为 info
  const severity = computed(() => (props.useUnit === 'px' ? 'success' : 'info'));

  // 标签文本：尺寸值 + 单位
  const label = computed(() => `${props.sizeValue ?? ''}${props.useUnit ?? ''}`);

  // 指示线起点/终点的外指箭头（CSS 零尺寸边框三角形）：
  // horizontal 起点朝左、终点朝右；vertical 起点朝上、终点朝下
  const START_ARROW_CLASS = computed(() =>
    props.isHorizontal
      ? 'h-0 w-0 shrink-0 border-y-[5px] border-l-0 border-r-[7px] border-y-transparent border-r-red-500'
      : 'h-0 w-0 shrink-0 border-x-[5px] border-b-[7px] border-t-0 border-x-transparent border-b-red-500'
  );
  const END_ARROW_CLASS = computed(() =>
    props.isHorizontal
      ? 'h-0 w-0 shrink-0 border-y-[5px] border-l-[7px] border-r-0 border-y-transparent border-l-red-500'
      : 'h-0 w-0 shrink-0 border-x-[5px] border-t-[7px] border-b-0 border-x-transparent border-t-red-500'
  );
</script>

<template>
  <span
    class="pointer-events-none absolute inset-0 z-100 flex overflow-hidden text-xs text-gray-500 dark:text-gray-400"
    :class="isHorizontal ? 'items-center' : 'flex-col items-center'"
  >
    <span :class="START_ARROW_CLASS"></span>
    <span :class="isHorizontal ? 'h-px flex-1 bg-red-500' : 'w-px flex-1 bg-red-500'"></span>
    <!-- 中央尺寸标签：点击循环切换单位（px 绿色 / % 蓝色） -->
    <Tag
      class="pointer-events-auto cursor-pointer"
      :severity="severity"
      :value="label"
      @click.stop="emit('toggleUnit')"
    />
    <span :class="isHorizontal ? 'h-px flex-1 bg-red-500' : 'w-px flex-1 bg-red-500'"></span>
    <span :class="END_ARROW_CLASS"></span>
  </span>
</template>
