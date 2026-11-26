<template>
  <div class="flex flex-col gap-2 bg-white rounded-md border border-gray-200 dark:border-gray-700">
    <!-- 顶部工具条：添加按钮 -->
    <div
      class="flex shrink-0 items-center justify-between gap-2 p-2 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <!-- 搜索框：按按钮名称过滤左侧按钮列表 -->
        <InputText
          v-model="keyword"
          class="w-50 border-0! shadow-none! bg-(--p-primary-50)!"
          size="small"
          placeholder="按按钮名称检索"
          :formControl="{ noValidate: true }"
        />
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <!-- 选中按钮的复制 / 删除操作 -->
        <div class="flex items-center gap-0.5">
          <Button
            v-tooltip.top="{ value: '复制' }"
            text
            iconOnly
            size="small"
            :disabled="!activeAction || isMoreActive"
            @click="copyAction(activeIndex)"
          >
            <NeuralIcon name="Copy" :size="12" />
          </Button>
          <Button
            v-tooltip.top="{ value: '删除' }"
            text
            iconOnly
            size="small"
            severity="danger"
            :disabled="!activeAction || isMoreActive"
            @click="removeActionWithConfirm"
          >
            <NeuralIcon name="Trash2" :size="12" />
          </Button>
        </div>
        <Button v-tooltip.top="{ value: '添加' }" iconOnly size="small" @click="addAction">
          <NeuralIcon name="Plus" :size="14" />
        </Button>
      </div>
    </div>

    <!-- Tab 头部（PrimeVue ScrollArea 横向滚动 + 拖拽排序） -->
    <ScrollArea class="border-0! px-2">
      <ScrollAreaViewport class="px-0! pt-8! pb-2! overflow-y-hidden!">
        <ScrollAreaContent>
          <div v-if="filteredActions.length > 0" class="flex items-center flex-nowrap gap-1">
            <template v-for="(action, index) in filteredActions" :key="action.id">
              <!-- 真实按钮：可拖拽排序 -->
              <SortableItem
                v-if="action.id !== MORE_ACTION_BTN_ID"
                :id="action.id"
                :index="realIndexOf(action.id)"
                :disabled="isFiltering"
                type="sortableAction"
                :data="{
                  name: action.content || '未命名',
                  icon: 'MousePointerClick',
                }"
                group="table-actions"
                class="group relative inline-block shrink-0 cursor-grab"
                :class="{
                  'before:pointer-events-none before:absolute before:-top-2 before:-left-1/2 before:right-0 before:h-2 before:border-t before:border-gray-400 before:content-[\'\']':
                    isOverflowIndex(index),
                  'before:rounded-tl-md before:border-l-2': isFirstOverflowIndex(index),
                }"
                @click="selectAction(action)"
              >
                <!-- 手绘下划线标注选中项 -->
                <div class="inline-block relative px-1.5 py-1 pb-3 overflow-hidden">
                  <Button
                    :label="action.content || '未命名'"
                    :severity="action.severity"
                    :variant="action.variant"
                    :rounded="action.rounded"
                    :raised="action.raised"
                    size="small"
                    :class="{ 'gap-1!': true }"
                  >
                    <NeuralIcon v-if="action.icon" :name="action.icon" :size="12" />
                    <span>{{ action.content || '未命名' }}</span>
                  </Button>
                  <!-- 推拽排序时若点击到↑按钮上，会阻止排序操作。增加此透明层以实现正常拖拽 -->
                  <div
                    v-rough-underline="activeId === action.id"
                    class="absolute top-0 left-0 right-0 bottom-2 bg-transparent z-10"
                  ></div>
                </div>
              </SortableItem>
              <!-- 「更多」按钮：固定在展示数量索引处，不可拖拽，仅可选中编辑 -->
              <div
                v-else
                class="group relative inline-block shrink-0"
                @click="selectAction(action)"
              >
                <!-- 固定指引：说明「更多」之后的按钮将在下拉中展示 -->
                <span
                  class="pointer-events-none absolute -top-7 left-full whitespace-nowrap text-xs text-gray-400 dark:text-gray-500"
                >
                  【{{ action.content }}】后面的按钮在下拉中展示
                </span>
                <div class="inline-block relative px-1.5 py-1 pb-3 overflow-hidden">
                  <Button
                    :severity="action.severity"
                    :variant="action.variant"
                    :rounded="action.rounded"
                    :raised="action.raised"
                    size="small"
                    :class="{ 'gap-1!': true }"
                  >
                    <NeuralIcon v-if="action.icon" :name="action.icon" :size="12" />
                    <span>{{ action.content || '未命名' }}</span>
                  </Button>
                  <div
                    v-rough-underline="activeId === action.id"
                    class="absolute top-0 left-0 right-0 bottom-2 bg-transparent z-10"
                  ></div>
                </div>
              </div>
            </template>
          </div>

          <!-- Tab 头部空态：区分"未找到匹配"和"无按钮" -->
          <div
            v-else
            class="flex w-full shrink-0 flex-col items-center gap-1 py-3 text-xs text-gray-400 dark:text-gray-500"
          >
            <NeuralIcon :name="isFiltering ? 'SearchX' : 'MousePointerClick'" :size="16" />
            <span>{{ isFiltering ? '未找到匹配的按钮' : '暂无按钮，点击右上角添加' }}</span>
          </div>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaHandle />
      </ScrollAreaScrollbar>
    </ScrollArea>

    <!-- 下：选中按钮的配置表单 -->
    <div class="flex flex-1 flex-col gap-2 overflow-auto px-2">
      <template v-if="activeAction">
        <NeuralForm
          :key="activeAction.id"
          :model-value="activeAction"
          :schema="actionSchema"
          :rules="actionRules"
          :columns="buttonConfig.formConfig.columns"
          @update:model-value="onActionChange"
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
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import buttonConfig, { createButton } from '@neural/core/forms/button';
  import { vRoughUnderline } from '@neural/directives/roughUnderline';
  import SortableItem from '@neural/dnd/components/sortableItem.vue';
  import { MORE_ACTION_BTN_ID } from '@neural/types/table';
  import { generateId } from '@neural/utils';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import ScrollArea from 'primevue/scrollarea';
  import ScrollAreaContent from 'primevue/scrollareacontent';
  import ScrollAreaHandle from 'primevue/scrollareahandle';
  import ScrollAreaScrollbar from 'primevue/scrollareascrollbar';
  import ScrollAreaViewport from 'primevue/scrollareaviewport';
  import vTooltip from 'primevue/tooltip';
  import { computed, ref, useAttrs, watch } from 'vue';

  defineOptions({ name: 'ActionAttrs' });

  type ActionModel = ReturnType<typeof createButton>;

  const model = defineModel<ActionModel[]>({ default: () => [] });

  /** 透传的表单值，用于读取操作列配置中的展示按钮数量 */
  const attrs = useAttrs();

  /** 配置的展示按钮数量：未配置 / 非法值时为 0（不限制，不注入「更多」） */
  const showActionCount = computed(() => {
    const formValues = attrs.formValues as Record<string, any> | undefined;
    const n = Number(formValues?.actionColumnConfig?.showActionCount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });

  /** 用户真实配置的按钮（剔除自动注入的「更多」占位按钮，用于计数 / 排序） */
  const realActions = computed<ActionModel[]>(() =>
    model.value.filter((action) => action.id !== MORE_ACTION_BTN_ID)
  );

  /** 编辑器展示的完整按钮列表（真实按钮 + 插入在展示数量索引处的「更多」），用于选中 / 编辑 / 渲染 */
  const displayActions = computed<ActionModel[]>(() => model.value);

  /** 构造「更多」按钮：结构与普通按钮完全一致，仅 id 固定 */
  function createMoreAction(): ActionModel {
    const action = createButton();
    action.id = MORE_ACTION_BTN_ID;
    action.content = '更多';
    return action;
  }

  /** 按展示数量同步「更多」按钮：真实按钮数 > 展示数时插入到展示数量索引处，否则移除；保留已有「更多」的配置 */
  function withMore(list: ActionModel[]): ActionModel[] {
    const real = list.filter((action) => action.id !== MORE_ACTION_BTN_ID);
    const existingMore =
      list.find((action) => action.id === MORE_ACTION_BTN_ID) ??
      model.value.find((action) => action.id === MORE_ACTION_BTN_ID) ??
      null;
    if (showActionCount.value > 0 && real.length > showActionCount.value) {
      // 「更多」插入到展示数量对应的索引位置，可视化标记截断点
      const insertAt = Math.min(showActionCount.value, real.length);
      const result = [...real];
      result.splice(insertAt, 0, existingMore ?? createMoreAction());
      return result;
    }
    return real;
  }

  /** 用最新的真实按钮列表重写 model（自动注入 / 移除「更多」） */
  function applyList(list: ActionModel[]) {
    model.value = withMore(list);
  }

  /** 当前选中的按钮 id */
  const activeId = ref('');

  /** 按钮搜索关键字 */
  const keyword = ref('');

  /** 删除确认弹层 */
  const { neuralConfirm } = useNeuralConfirm();

  /** 是否处于搜索过滤状态（过滤时禁用拖拽，避免可见索引与真实索引错位） */
  const isFiltering = computed(() => keyword.value.trim().length > 0);

  /** 关键字是否命中按钮名称 */
  function matchKeyword(action: ActionModel, keywordText: string): boolean {
    return action.content?.toLowerCase().includes(keywordText) ?? false;
  }

  /** 搜索过滤后的按钮；支持空格分隔多关键字（需全部命中按钮名称） */
  const filteredActions = computed(() => {
    const keywords = keyword.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    // 保留 model 中「更多」的索引位置（展示数量处），且不受搜索过滤影响，便于随时编辑
    return displayActions.value.filter((action) => {
      if (action.id === MORE_ACTION_BTN_ID) return true;
      return keywords.every((item) => matchKeyword(action, item));
    });
  });

  /** 「更多」在过滤后列表中的索引，-1 表示当前未展示「更多」 */
  const moreFilteredIndex = computed(() =>
    filteredActions.value.findIndex((action) => action.id === MORE_ACTION_BTN_ID)
  );

  /** 是否为「更多」之后、会被收进下拉的按钮（按过滤后可见索引判断） */
  function isOverflowIndex(index: number): boolean {
    return moreFilteredIndex.value >= 0 && index > moreFilteredIndex.value;
  }

  /** 是否为「更多」之后的第一个按钮（标识线的起点） */
  function isFirstOverflowIndex(index: number): boolean {
    return moreFilteredIndex.value >= 0 && index === moreFilteredIndex.value + 1;
  }

  /** 真实按钮在 realActions 中的索引（供 SortableItem 使用，避免「更多」占位导致索引错位） */
  function realIndexOf(id: string): number {
    return realActions.value.findIndex((action) => action.id === id);
  }

  /** 当前选中的按钮（含「更多」） */
  const activeAction = computed(
    () => displayActions.value.find((action) => action.id === activeId.value) ?? null
  );

  /** 当前选中按钮在 realActions 中的索引（复制 / 删除仅作用于真实按钮），未选中时为 -1 */
  const activeIndex = computed(() =>
    realActions.value.findIndex((action) => action.id === activeId.value)
  );

  /** 当前选中的是否为「更多」按钮：不可复制 / 删除 */
  const isMoreActive = computed(() => activeAction.value?.id === MORE_ACTION_BTN_ID);

  /** 选中按钮的配置表单 schema */
  const actionSchema = computed<FormItemProps[]>(() => buttonConfig.formConfig.schema);

  /** 按钮配置表单校验规则 */
  const actionRules = computed(() => buttonConfig.formConfig.rules);

  /** 同步按钮配置到数组，保持 id 不变并按展示数量重排「更多」 */
  function onActionChange(value: Record<string, any> | undefined) {
    if (!value) return;
    // 在完整列表（含「更多」）上替换，保持 id 不变；编辑「更多」时其配置也会被保留
    const next = displayActions.value.map((action) =>
      action.id === activeId.value
        ? ({ ...action, ...value, id: action.id } as ActionModel)
        : action
    );
    applyList(next);
  }

  /** 添加新按钮并选中 */
  function addAction() {
    const action = createButton();
    applyList([...realActions.value, action]);
    activeId.value = action.id;
  }

  /** 选中按钮 */
  function selectAction(action: ActionModel) {
    activeId.value = action.id;
  }

  /** 复制按钮：在当前按钮后插入同配置的新按钮并选中 */
  function copyAction(index: number) {
    // 「更多」按钮由系统注入，不允许复制
    if (index < 0 || isMoreActive.value) return;
    const source = realActions.value[index];
    if (!source) return;
    const action: ActionModel = { ...source, id: generateId('button-') };
    const list = [...realActions.value];
    list.splice(index + 1, 0, action);
    applyList(list);
    activeId.value = action.id;
  }

  /** 删除按钮：先弹确认，确认后再删除 */
  function removeActionWithConfirm(event: MouseEvent) {
    const action = activeAction.value;
    // 「更多」按钮由系统按展示数量自动增删，不允许手动删除
    if (!action || isMoreActive.value) return;
    neuralConfirm({
      target: event.currentTarget as HTMLElement,
      message: `确认删除按钮【${action.content || '未命名'}】吗？`,
      type: 'delete',
      confirm: () => removeAction(activeIndex.value),
    });
  }

  /** 删除按钮：保持选中有效项 */
  function removeAction(index: number) {
    if (index < 0 || isMoreActive.value) return;
    const list = [...realActions.value];
    const [removed] = list.splice(index, 1);
    if (removed?.id === activeId.value) {
      const next = list[index] ?? list[index - 1];
      activeId.value = next?.id ?? '';
    }
    applyList(list);
  }

  /** 按钮拖拽排序组标识，避免与页面其他拖拽区域互相干扰 */
  const ACTION_SORT_GROUP = 'table-actions';

  /** 拖拽结束后按可排序项索引重排按钮数组 */
  useDragDropMonitor({
    onDragEnd(event) {
      console.log('表格按钮拖拽结束: 类型', event.operation?.source?.type);
      if (event.operation?.source?.type !== 'sortableAction') return;
      if (event.canceled) return;
      const { source } = event.operation;
      if (!source || !isSortable(source) || source.group !== ACTION_SORT_GROUP) return;
      const from = source.initialIndex;
      const to = source.index;
      if (from === to) return;
      const list = [...realActions.value];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      applyList(list);
    },
  });

  // 展示按钮数量变化（含初始化）时，重新注入 / 移除「更多」
  watch(showActionCount, () => applyList(realActions.value), { immediate: true });

  // 选中项失效（外部替换/删除）时，回退到第一项
  watch(
    () => realActions.value.map((action) => action.id).join(','),
    () => {
      if (activeAction.value) return;
      activeId.value = realActions.value[0]?.id ?? '';
    },
    { immediate: true }
  );
</script>
