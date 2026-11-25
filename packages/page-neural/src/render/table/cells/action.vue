<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { MORE_ACTION_BTN_ID } from '@neural/types/table';
  import type { ActionButton, TableColumn } from '@neural/types/table';
  import Button from 'primevue/button';
  import Menu from 'primevue/menu';
  import type { MenuItem } from 'primevue/menuitem';
  import { computed, ref } from 'vue';

  interface Props {
    /** 当前行数据 */
    row: Record<string, unknown>;
    /** 操作列配置 */
    column: Partial<TableColumn>;
    /** 操作列按钮列表（配置层可能已注入固定 id 的「更多」按钮） */
    actionBtns: ActionButton[];
  }

  const props = defineProps<Props>();

  /** 「更多」下拉菜单引用 */
  const moreMenu = ref<InstanceType<typeof Menu> | null>(null);

  /** 操作列按钮列表 */
  const buttons = computed<ActionButton[]>(() =>
    Array.isArray(props.actionBtns) ? props.actionBtns : []
  );

  /** 配置层按固定 id 注入的「更多」按钮 */
  const moreButton = computed(
    () => buttons.value.find((btn) => btn.id === MORE_ACTION_BTN_ID) ?? null
  );

  /** 排除「更多」按钮后的真实按钮 */
  const otherButtons = computed(() => buttons.value.filter((btn) => btn.id !== MORE_ACTION_BTN_ID));

  /** 直接展示的按钮数量：未配置 / 非法值时全部直接展示 */
  const visibleCount = computed(() => {
    const count = Number(props.column.showActionCount);
    return Number.isFinite(count) && count > 0 ? count : otherButtons.value.length;
  });

  /** 直接展示的按钮 */
  const visibleButtons = computed(() => otherButtons.value.slice(0, visibleCount.value));

  /** 收进「更多」下拉的按钮 */
  const overflowButtons = computed(() => otherButtons.value.slice(visibleCount.value));

  /** 「更多」下拉菜单项：通过 custom 字段携带原始按钮数据，供 item 插槽使用 */
  const moreItems = computed<MenuItem[]>(() =>
    overflowButtons.value.map(
      (btn) => ({ label: btn.content, icon: btn.icon, _btn: btn }) as MenuItem
    )
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
        :severity="btn.severity"
        :variant="btn.variant"
        :rounded="btn.rounded"
        :raised="btn.raised"
        size="small"
        class="gap-1!"
      >
        <NeuralIcon v-if="btn.icon" :name="btn.icon" :size="12" />
        <span>{{ btn.content }}</span>
      </Button>
      <!-- 超出展示数量的按钮收进「更多」下拉 -->
      <template v-if="overflowButtons.length > 0">
        <Button
          :severity="moreButton?.severity"
          :variant="moreButton?.variant ?? 'text'"
          :rounded="moreButton?.rounded"
          :raised="moreButton?.raised"
          size="small"
          class="gap-1!"
          @click="toggleMoreMenu"
        >
          <NeuralIcon v-if="moreButton?.icon" :name="moreButton?.icon || ''" :size="12" />
          <span>{{ moreButton?.content || '更多' }}</span>
          <NeuralIcon name="ChevronDown" :size="12" />
        </Button>
        <Menu ref="moreMenu" :model="moreItems" :pt="{ root: { class: 'min-w-auto!' } }" popup>
          <template #item="{ item, props: itemProps }">
            <Button
              v-bind="itemProps.action"
              :severity="(item._btn as ActionButton)?.severity"
              :variant="(item._btn as ActionButton)?.variant ?? 'text'"
              :rounded="(item._btn as ActionButton)?.rounded"
              :raised="(item._btn as ActionButton)?.raised"
              size="small"
              class="gap-1!"
            >
              <NeuralIcon v-if="item.icon as string" :name="item.icon as string" :size="12" />
              <span>{{ item.label }}</span>
            </Button>
          </template>
        </Menu>
      </template>
    </div>
  </span>
</template>
