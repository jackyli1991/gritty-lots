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
            :disabled="!activeAction"
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
            :disabled="!activeAction"
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
      <ScrollAreaViewport class="px-0! py-2! overflow-y-hidden!">
        <ScrollAreaContent>
          <div v-if="filteredActions.length > 0" class="flex items-center flex-nowrap gap-1">
            <SortableItem
              v-for="(action, position) in filteredActions"
              :key="action.id"
              :id="action.id"
              :index="position"
              :disabled="isFiltering"
              type="sortableAction"
              :data="{
                name: action.content || '未命名',
                icon: 'MousePointerClick',
              }"
              group="table-actions"
              class="group relative inline-block shrink-0 cursor-grab"
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
  import { generateId } from '@neural/utils';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import ScrollArea from 'primevue/scrollarea';
  import ScrollAreaContent from 'primevue/scrollareacontent';
  import ScrollAreaHandle from 'primevue/scrollareahandle';
  import ScrollAreaScrollbar from 'primevue/scrollareascrollbar';
  import ScrollAreaViewport from 'primevue/scrollareaviewport';
  import vTooltip from 'primevue/tooltip';
  import { computed, ref, watch } from 'vue';

  defineOptions({ name: 'ActionAttrs' });

  type ActionModel = ReturnType<typeof createButton>;

  const model = defineModel<ActionModel[]>({ default: () => [] });

  /** 提交变更：以新数组回写，保证视图与表单同步更新 */
  function commit() {
    model.value = model.value.map((action) => ({ ...action }));
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
    return model.value.filter((action) => keywords.every((item) => matchKeyword(action, item)));
  });

  /** 当前选中的按钮 */
  const activeAction = computed(
    () => model.value.find((action) => action.id === activeId.value) ?? null
  );

  /** 当前选中按钮在数组中的索引，未选中时为 -1 */
  const activeIndex = computed(() =>
    model.value.findIndex((action) => action.id === activeId.value)
  );

  /** 选中按钮的配置表单 schema */
  const actionSchema = computed<FormItemProps[]>(() => buttonConfig.formConfig.schema);

  /** 按钮配置表单校验规则 */
  const actionRules = computed(() => buttonConfig.formConfig.rules);

  /** 同步按钮配置到数组，保持 id 不变并触发表单更新 */
  function onActionChange(value: Record<string, any> | undefined) {
    if (!value) return;
    model.value = model.value.map((action) =>
      action.id === activeId.value
        ? ({ ...action, ...value, id: action.id } as ActionModel)
        : action
    );
  }

  /** 添加新按钮并选中 */
  function addAction() {
    const action = createButton();
    model.value.push(action);
    activeId.value = action.id;
    commit();
  }

  /** 选中按钮 */
  function selectAction(action: ActionModel) {
    activeId.value = action.id;
  }

  /** 复制按钮：在当前按钮后插入同配置的新按钮并选中 */
  function copyAction(index: number) {
    if (index < 0) return;
    const source = model.value[index];
    if (!source) return;
    const action: ActionModel = { ...source, id: generateId('button-') };
    model.value.splice(index + 1, 0, action);
    activeId.value = action.id;
    commit();
  }

  /** 删除按钮：先弹确认，确认后再删除 */
  function removeActionWithConfirm(event: MouseEvent) {
    const action = activeAction.value;
    if (!action) return;
    neuralConfirm({
      target: event.currentTarget as HTMLElement,
      message: `确认删除按钮【${action.content || '未命名'}】吗？`,
      type: 'delete',
      confirm: () => removeAction(activeIndex.value),
    });
  }

  /** 删除按钮：保持选中有效项 */
  function removeAction(index: number) {
    if (index < 0) return;
    const [removed] = model.value.splice(index, 1);
    if (removed?.id === activeId.value) {
      const next = model.value[index] ?? model.value[index - 1];
      activeId.value = next?.id ?? '';
    }
    commit();
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
      const list = [...model.value];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      model.value = list;
    },
  });

  // 选中项失效（外部替换/删除）时，回退到第一项
  watch(
    () => model.value.map((action) => action.id).join(','),
    () => {
      if (activeAction.value) return;
      activeId.value = model.value[0]?.id ?? '';
    },
    { immediate: true }
  );
</script>
