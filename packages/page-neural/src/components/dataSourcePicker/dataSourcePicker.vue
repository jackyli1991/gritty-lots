<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import { resolveDataSourcePreview } from '@neural/render/utils/dataSourcePreview';
  import { usePageNeuralStore } from '@neural/store';
  import type { Container, DataSource, LayoutSplitterNode } from '@neural/types';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import type { TreeNode } from 'primevue/treenode';
  import TreeSelect from 'primevue/treeselect';
  import { computed, ref, watch } from 'vue';

  /** 数据源选择结果 */
  interface DataSourceSelection {
    /** 发起请求的容器 / 组件 / 页面 id；JSON 数据源为空字符串 */
    originId: string;
    /** 数据源 id */
    sourceId: string;
  }

  interface Props {
    modelValue?: DataSourceSelection | null;
    name?: string;
    invalid?: boolean;
    disabled?: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{ 'update:modelValue': [value: DataSourceSelection | null] }>();

  const pageNeuralStore = usePageNeuralStore();

  /** 数据模型配置中本组件关心的字段 */
  interface DataModelConfig {
    enable?: boolean;
    sourceId?: string;
  }

  /** 层级实体：页面 / 容器 / 节点均可能挂载 props.dataModel */
  interface HierarchyEntity {
    id?: string;
    name?: string;
    title?: string;
    parentId?: string;
    containerId?: string;
    props?: Record<string, unknown>;
    children?: string[];
  }

  /** 可选中节点的业务数据 */
  interface NodeData extends DataSourceSelection {
    /** 来源类型：层级实体或 JSON 数据源 */
    kind: 'origin' | 'json';
  }

  /** key → 节点数据，用于把 TreeSelect 的选中 key 还原为业务值 */
  const nodeDataMap = new Map<string, NodeData>();

  /** 读取实体上的 dataModel 配置 */
  function getDataModel(entity: { props?: Record<string, unknown> }): DataModelConfig | undefined {
    return entity.props?.dataModel as DataModelConfig | undefined;
  }

  /** 是否可作为数据来源：dataModel 存在、开启且配置了数据源 */
  function isEntitySelectable(entity: { props?: Record<string, unknown> }): boolean {
    const dataModel = getDataModel(entity);
    return !!dataModel && dataModel.enable === true && !!dataModel.sourceId;
  }

  /** 生成层级节点：未开启 dataModel 的实体仍然展示，但不可选择 */
  function createEntityNode(
    entity: HierarchyEntity,
    keyPrefix: 'page' | 'container' | 'node',
    fallbackLabel: string,
    children: TreeNode[] = []
  ): TreeNode {
    const key = `${keyPrefix}:${entity.id}`;
    const selectable = isEntitySelectable(entity);

    if (selectable) {
      nodeDataMap.set(key, {
        kind: 'origin',
        originId: entity.id ?? '',
        sourceId: getDataModel(entity)!.sourceId ?? '',
      });
    }

    return {
      key,
      label: entity.name || entity.title || fallbackLabel,
      selectable,
      children,
    };
  }

  /** JSON 数据源没有层级，直接作为第一层可选项 */
  function createJsonSourceNode(source: DataSource): TreeNode | null {
    if (!source.id) return null;

    const key = `source:${source.id}`;
    nodeDataMap.set(key, { kind: 'json', originId: '', sourceId: source.id });
    return {
      key,
      label: source.name || '未命名数据源',
      selectable: true,
    };
  }

  /** store 中的 nodes 暂无强类型，按 parentId / containerId 归属到容器 */
  function getContainerNodes(containerId: string): HierarchyEntity[] {
    return (pageNeuralStore.nodes as unknown as HierarchyEntity[]).filter(
      (node) => !!node.id && (node.parentId === containerId || node.containerId === containerId)
    );
  }

  /** 按 id 查找节点，用于递归挂载子节点 */
  function getNodeById(id: string): HierarchyEntity | undefined {
    return (pageNeuralStore.nodes as unknown as HierarchyEntity[]).find((node) => node.id === id);
  }

  /** 构建节点及其子节点，ancestors 用于避免循环引用 */
  function buildNode(node: HierarchyEntity, ancestors: Set<string>): TreeNode {
    const children: TreeNode[] = [];

    if (node.id && !ancestors.has(node.id)) {
      const nextAncestors = new Set(ancestors).add(node.id);
      for (const childId of node.children ?? []) {
        const child = getNodeById(childId);
        if (child) children.push(buildNode(child, nextAncestors));
      }
    }

    return createEntityNode(node, 'node', '未命名节点', children);
  }

  /** 构建容器及其子容器、归属节点 */
  function buildContainer(container: Container, ancestors: Set<string>): TreeNode {
    const children: TreeNode[] = [];

    if (!ancestors.has(container.id)) {
      const nextAncestors = new Set(ancestors).add(container.id);
      const addedNodeIds = new Set<string>();

      for (const childId of container.children ?? []) {
        if (nextAncestors.has(childId)) continue;

        const childContainer = pageNeuralStore.getContainer(childId);
        if (childContainer) {
          children.push(buildContainer(childContainer, nextAncestors));
          continue;
        }

        // children 也可能直接引用节点
        const childNode = getNodeById(childId);
        if (childNode) {
          children.push(buildNode(childNode, nextAncestors));
          if (childNode.id) addedNodeIds.add(childNode.id);
        }
      }

      // 兼容通过 parentId / containerId 归属的节点
      for (const node of getContainerNodes(container.id)) {
        if (!node.id || addedNodeIds.has(node.id)) continue;
        children.push(buildNode(node, nextAncestors));
      }
    }

    return createEntityNode(container, 'container', '未命名容器', children);
  }

  /** 递归遍历布局面板，叶子面板上挂载对应容器 */
  function buildPanels(splitter: LayoutSplitterNode, ancestors: Set<string>): TreeNode[] {
    return splitter.children.flatMap((panel) => {
      if (panel.children.length) {
        return panel.children.flatMap((child) => buildPanels(child, ancestors));
      }
      if (!panel.containerId) return [];

      const container = pageNeuralStore.getContainer(panel.containerId);
      return container ? [buildContainer(container, ancestors)] : [];
    });
  }

  /** 布局自身没有 dataModel，仅作为分组展示 */
  function buildLayout(layout: LayoutSplitterNode): TreeNode {
    return {
      key: `layout:${layout.id}`,
      label: layout.name || '未命名布局',
      selectable: false,
      children: buildPanels(layout, new Set<string>()),
    };
  }

  /** 页面 → 布局 → 容器 → 节点，并追加无层级的 JSON 数据源 */
  const treeOptions = computed<TreeNode[]>(() => {
    nodeDataMap.clear();
    const options: TreeNode[] = [];

    for (const page of pageNeuralStore.pages) {
      const layout = pageNeuralStore.layouts.find((item) => item.id === page.layoutId);
      options.push(
        createEntityNode(page, 'page', '未命名页面', layout ? [buildLayout(layout)] : [])
      );
    }

    for (const source of pageNeuralStore.dataSources) {
      if (source.type !== 'json') continue;
      const node = createJsonSourceNode(source);
      if (node) options.push(node);
    }

    return options;
  });

  /** TreeSelect 的选中 key 映射（单选模式仅一个 key） */
  const selectedKeys = ref<Record<string, boolean>>({});

  /** 根据外部选中值定位对应的树节点 key */
  function findKeyByValue(value?: DataSourceSelection | null): string | undefined {
    if (!value) return undefined;
    for (const [key, item] of nodeDataMap) {
      if (item.originId === value.originId && item.sourceId === value.sourceId) return key;
    }
    return undefined;
  }

  /** 同步外部值到 TreeSelect 选中状态，数据树变化后重新映射 */
  watch(
    [treeOptions, () => props.modelValue],
    () => {
      const key = findKeyByValue(props.modelValue);
      selectedKeys.value = key ? { [key]: true } : {};
    },
    { immediate: true }
  );

  /** 将选中的 key 还原为业务值 */
  function onSelectionChange(keys: Record<string, boolean> | null) {
    const selectedKey = keys ? Object.keys(keys).find((key) => keys[key]) : undefined;
    if (!selectedKey) {
      emit('update:modelValue', null);
      return;
    }

    const data = nodeDataMap.get(selectedKey);
    emit('update:modelValue', data ? { originId: data.originId, sourceId: data.sourceId } : null);
  }

  /** 预览弹窗显隐 */
  const previewVisible = ref(false);

  /** 预览数据 */
  const previewData = ref<unknown>(null);

  /** 是否已选中可预览的数据源 */
  const canPreview = computed(() => !!props.modelValue?.originId || !!props.modelValue?.sourceId);

  /** 预览内容序列化，空数据返回空字符串 */
  const previewText = computed(() => {
    if (previewData.value === null || previewData.value === undefined) return '';
    try {
      return JSON.stringify(previewData.value, null, 2);
    } catch {
      return String(previewData.value);
    }
  });

  /** 解析当前选中来源的数据并打开预览弹窗 */
  function openPreview() {
    if (!props.modelValue) return;
    previewData.value = resolveDataSourcePreview(props.modelValue);
    previewVisible.value = true;
  }
</script>

<template>
  <div class="flex w-full items-center gap-1">
    <TreeSelect
      :model-value="selectedKeys"
      :options="treeOptions"
      :name="name"
      :invalid="invalid"
      :disabled="disabled"
      selection-mode="single"
      filter
      filter-placeholder="搜索页面 / 容器 / 数据源"
      placeholder="请选择数据源"
      empty-message="暂无可选数据源"
      show-clear
      fluid
      scroll-height="18rem"
      class="min-w-0 flex-1"
      @update:model-value="onSelectionChange"
    >
      <template #option="{ node }">
        <span :class="node.selectable === false ? 'text-gray-400 dark:text-gray-500' : ''">
          {{ node.label }}
        </span>
      </template>
    </TreeSelect>

    <!-- 预览按钮：解析当前选中来源的数据 -->
    <Button
      text
      rounded
      size="small"
      severity="secondary"
      aria-label="预览数据"
      :disabled="!canPreview"
      @click="openPreview"
    >
      <NeuralIcon name="Eye" :size="14" />
    </Button>

    <Dialog
      v-model:visible="previewVisible"
      modal
      header="数据预览"
      class="!w-[42rem] max-w-[92vw]"
      :pt="{ header: { class: 'py-2!' }, title: { class: 'text-sm!' } }"
    >
      <pre
        v-if="previewText"
        class="max-h-[60vh] overflow-auto rounded bg-gray-50 p-3 text-xs break-all whitespace-pre-wrap text-gray-700 dark:bg-gray-900 dark:text-gray-200"
        v-text="previewText"
      />
      <div v-else class="py-6 text-center text-xs text-gray-400 dark:text-gray-500">
        暂无数据，请先让该来源完成数据加载
      </div>
    </Dialog>
  </div>
</template>
