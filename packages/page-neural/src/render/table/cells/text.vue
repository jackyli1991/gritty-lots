<script setup lang="ts">
  import type { TableColumn } from '@neural/types/table';
  import vTooltip from 'primevue/tooltip';
  import { computed, unref, type CSSProperties } from 'vue';

  import { useColumnData } from '../useColumnData';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 当前列配置 */
    column: TableColumn;
  }

  const props = defineProps<Props>();

  const { fieldData, prefix, suffix } = useColumnData(props.row, props.column);

  /** 最多显示行数：未配置或非法时回退 1（单行） */
  const rows = computed(() => {
    const n = Number(props.column.rows);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  });

  /** 多行省略样式：行数 > 1 时启用 line-clamp；单行走 truncate 类 */
  const clampStyle = computed<CSSProperties | undefined>(() =>
    rows.value > 1
      ? {
          display: '-webkit-box',
          WebkitLineClamp: String(rows.value),
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          // DataTable 的 td 默认 white-space: nowrap，需复位才能换行
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
        }
      : undefined
  );

  /**
   * tooltip 配置：
   * 1. 用 computed 缓存稳定引用，避免模板内联对象字面量触发指令反复更新；
   * 2. value 必须序列化为字符串——PrimeVue tooltip 指令内部会对 value 调用
   *    `.trim()`，若 fieldData 是 number / boolean 等非字符串会抛 TypeError，
   *    指令钩子抛错会导致 DataTable 渲染重试闭环，最终
   *    Maximum recursive updates exceeded，表格无法渲染。
   */
  const tooltipValue = computed(() => {
    const text = unref(fieldData) ?? '';
    return text ? { value: String(text), autoHide: false } : undefined;
  });
</script>

<template>
  <span
    v-if="fieldData"
    v-tooltip.top="tooltipValue"
    class="block"
    :class="{ truncate: rows === 1 }"
    :style="clampStyle"
    >{{ prefix }}{{ fieldData }}{{ suffix }}</span
  >
</template>
