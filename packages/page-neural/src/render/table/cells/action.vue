<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import type { TableActionButton, TableColumn } from '@neural/types/table';
  import Button from 'primevue/button';
  import Menu from 'primevue/menu';
  import type { MenuItem } from 'primevue/menuitem';
  import { computed, ref } from 'vue';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 当前列配置 */
    column: TableColumn;
  }

  const props = defineProps<Props>();

  /** 「更多」下拉菜单引用 */
  const moreMenu = ref<InstanceType<typeof Menu> | null>(null);

  /** 操作列配置的按钮列表 */
  const buttons = computed<TableActionButton[]>(() =>
    Array.isArray(props.column.actionBtns) ? props.column.actionBtns : []
  );

  /** 直接展示的按钮数量：未配置时全部直接展示 */
  const visibleCount = computed(() => {
    const count = Number(props.column.showBtnCount);
    return Number.isFinite(count) && count > 0 ? count : buttons.value.length;
  });

  /** 直接展示的按钮 */
  const visibleButtons = computed(() => buttons.value.slice(0, visibleCount.value));

  /** 收进「更多」下拉的按钮 */
  const overflowButtons = computed(() => buttons.value.slice(visibleCount.value));

  /** 「更多」按钮文本，未配置时回退默认文案 */
  const moreText = computed(() => props.column.moreBtnText?.trim() || '更多');

  /** 「更多」下拉菜单项 */
  const moreItems = computed<MenuItem[]>(() =>
    overflowButtons.value.map((btn) => ({ label: btn.content }))
  );

  /** 打开「更多」下拉菜单 */
  function toggleMoreMenu(event: MouseEvent) {
    moreMenu.value?.toggle(event);
  }
</script>

<template>
  <span class="inline-block">
    <div class="flex flex-nowrap items-center gap-1">
      <Button
        v-for="btn in visibleButtons"
        :key="btn.id"
        :label="btn.content"
        :severity="btn.severity"
        :variant="btn.variant"
        :rounded="btn.rounded"
        :raised="btn.raised"
        size="small"
      />
      <!-- 超出展示数量的按钮收进「更多」下拉 -->
      <template v-if="overflowButtons.length > 0">
        <Button class="gap-1!" size="small" text @click="toggleMoreMenu">
          <span>{{ moreText }}</span>
          <NeuralIcon name="ChevronDown" :size="12" />
        </Button>
        <Menu ref="moreMenu" :model="moreItems" popup />
      </template>
    </div>
  </span>
</template>
