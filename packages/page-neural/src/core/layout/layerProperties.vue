<script setup lang="ts">
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import { containerOptions } from '@neural/data/options';
  import { usePageNeuralStore } from '@neural/store';
  import { useLayoutStore } from '@neural/store/layout';
  import type { ContainerType, LayoutPanelNode } from '@neural/types';
  import { storeToRefs } from 'pinia';
  import Button from 'primevue/button';
  import InputNumber from 'primevue/inputnumber';
  import InputText from 'primevue/inputtext';
  import Select from 'primevue/select';
  import Tag from 'primevue/tag';
  import { computed } from 'vue';

  import ColorPicker from '../../components/colorPicker';
  import { findLayoutNode, findPanelParentSplitter, getPanelSplitter } from './utils';

  // 图层属性面板：展示并编辑当前选中分隔器 / 面板的属性
  defineOptions({ name: 'LayerProperties' });

  const layoutStore = useLayoutStore();
  const pageNeuralStore = usePageNeuralStore();
  const { selectedNode, locked } = storeToRefs(layoutStore);

  // 按 id 从布局树解析实际节点，节点被删除时自然为 null
  const selected = computed(() => {
    const current = selectedNode.value;
    if (!current) return null;
    return findLayoutNode(pageNeuralStore.activeLayout, current.id) ?? null;
  });

  const splitterNode = computed(() =>
    selected.value?.type === 'splitter' ? selected.value : null
  );

  const panelNode = computed(() =>
    selected.value?.type === 'splitterPanel' ? selected.value : null
  );

  // 存在 % 单位面板时才允许平均分配
  const canDistribute = computed(
    () =>
      !!splitterNode.value &&
      splitterNode.value.children.some((panel) => (panel.useUnit ?? '%') === '%')
  );

  const { neuralConfirm } = useNeuralConfirm();

  // 容器类型：切换前若面板已关联容器且与容器 subType 不一致，先弹确认框
  const containerTypeModel = computed<ContainerType>({
    get: () => panelNode.value?.containerType ?? 'normal',
    set: (type) => {
      const panel = panelNode.value;
      if (!panel) return;

      const container = panel.containerId
        ? pageNeuralStore.getContainer(panel.containerId)
        : undefined;

      if (container && container.subType !== type) {
        neuralConfirm({
          header: '切换类型',
          message: '该面板已关联容器，更改类型可能导致容器内的元素渲染异常，是否继续？',
          type: 'alert',
          confirmText: '继续',
          confirm: () => {
            panel.containerType = type;
          },
        });
      } else {
        panel.containerType = type;
      }
    },
  });

  // 面板背景色：写入 store，空值即清除
  const backgroundColor = computed<string>({
    get: () => panelNode.value?.backgroundColor ?? '',
    set: (color) => {
      if (panelNode.value) layoutStore.setPanelBackground(panelNode.value, color);
    },
  });

  function onGapChange(value: number | null) {
    if (!splitterNode.value) return;
    layoutStore.updateSplitterGap(splitterNode.value, value ?? 0);
  }

  function clearBackground() {
    if (!panelNode.value) return;
    layoutStore.setPanelBackground(panelNode.value, '');
  }

  // 单位对应的标签样式：px 为 success，% 为 info（与画布指示线一致）
  function unitSeverity(unit: LayoutPanelNode['useUnit']) {
    return unit === 'px' ? 'success' : 'info';
  }

  // 标签文本：尺寸值 + 单位
  function unitLabel(panel: LayoutPanelNode) {
    return `${panel.sizeValue ?? ''}${panel.useUnit ?? ''}`;
  }

  // 点击标签循环切换面板尺寸单位；布局锁定时禁用
  function toggleUnit(panel: LayoutPanelNode) {
    if (locked.value) return;
    const splitter = findPanelParentSplitter(pageNeuralStore.activeLayout, panel.id);
    if (!splitter) return;
    layoutStore.toggleUnit(splitter, panel);
  }
</script>

<template>
  <aside
    class="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto border-l border-gray-200 pl-2 text-xs dark:border-gray-700"
  >
    <!-- 未选中 -->
    <div
      v-if="!splitterNode && !panelNode"
      class="py-6 text-center text-gray-400 dark:text-gray-500"
    >
      点击左侧图层查看属性
    </div>

    <!-- 分隔器属性 -->
    <template v-else-if="splitterNode">
      <div class="flex items-center justify-between">
        <span class="font-medium text-gray-700 dark:text-gray-200">分隔器</span>
        <span class="text-gray-400 dark:text-gray-500">
          {{ splitterNode.layout === 'horizontal' ? '水平布局' : '垂直布局' }}
        </span>
      </div>
      <label class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span class="shrink-0">名称</span>
        <InputText
          v-model="splitterNode.name"
          class="w-full"
          size="small"
          placeholder="分隔器名称"
          :disabled="locked"
        />
      </label>
      <label class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span class="shrink-0">间距</span>
        <InputNumber
          size="small"
          :model-value="splitterNode.gap"
          :min="0"
          :step="1"
          fluid
          showButtons
          suffix=" px"
          :disabled="locked"
          @update:model-value="onGapChange"
        />
      </label>
      <Button
        size="small"
        :disabled="locked || !canDistribute"
        @click="layoutStore.distributePanelsEvenly(splitterNode)"
      >
        平均分配占比
      </Button>
    </template>

    <!-- 面板属性 -->
    <template v-else-if="panelNode">
      <div class="flex items-center justify-between">
        <span class="font-medium text-gray-700 dark:text-gray-200">面板</span>
        <span class="text-gray-400 dark:text-gray-500">背景与尺寸</span>
      </div>
      <label class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span class="shrink-0">名称</span>
        <InputText
          v-model="panelNode.name"
          class="w-full"
          size="small"
          placeholder="面板名称"
          :disabled="locked"
        />
      </label>
      <label class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span class="shrink-0">类型</span>
        <Select
          v-model="containerTypeModel"
          class="w-full"
          size="small"
          :options="containerOptions"
          optionLabel="label"
          optionValue="value"
          :disabled="locked || !!getPanelSplitter(panelNode)"
        />
      </label>
      <div v-if="getPanelSplitter(panelNode)" class="text-[11px] text-gray-400 dark:text-gray-500">
        包含嵌套的面板，容器类型不可设置
      </div>
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span class="shrink-0">背景</span>
        <div :class="locked ? 'pointer-events-none opacity-50' : ''">
          <ColorPicker v-model="backgroundColor" size="small" />
        </div>
        <Button
          v-if="panelNode.backgroundColor"
          size="small"
          severity="secondary"
          :disabled="locked"
          @click="clearBackground"
        >
          清除背景
        </Button>
      </div>
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span class="shrink-0">尺寸</span>
        <Tag
          class="cursor-pointer"
          :class="locked ? 'cursor-default opacity-50' : ''"
          :severity="unitSeverity(panelNode.useUnit)"
          :value="unitLabel(panelNode)"
          :pt="{
            root: {
              style: {
                backgroundColor: 'transparent',
                padding: '0 4px',
              },
            },
          }"
          @click.stop="toggleUnit(panelNode)"
        />
      </div>
    </template>
  </aside>
</template>
