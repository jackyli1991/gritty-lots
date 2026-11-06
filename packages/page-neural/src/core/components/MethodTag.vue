<script setup lang="ts">
  // 请求方法徽标：按 method 着色（GET 绿 / POST 蓝 / PUT 橙 / DELETE 红），
  // 未识别的方法使用中性色；method 为空时显示 fallback 文本
  import { computed } from 'vue';

  interface Props {
    method?: string; // HTTP 方法，如 get / post
    fallback?: string; // method 为空时的展示文本
  }

  const props = withDefaults(defineProps<Props>(), {
    fallback: 'GET',
  });

  /** method 配色映射（key 为小写） */
  const methodColorMap: Record<string, string> = {
    get: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    post: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    put: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    delete: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  /** 未识别方法的中性配色 */
  const neutralColor = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';

  const colorClass = computed(
    () => methodColorMap[props.method?.toLowerCase() ?? ''] ?? neutralColor
  );

  const text = computed(() => props.method || props.fallback);
</script>

<template>
  <span class="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold uppercase" :class="colorClass">
    {{ text }}
  </span>
</template>
