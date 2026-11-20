<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import CodeMirror from '@neural/components/codeMirror';
  import ObjectEditor from '@neural/components/objectEditor';
  import { nestedFormControl } from '@neural/composables/useForm';
  import MethodTag from '@neural/core/components/MethodTag.vue';
  import type { DataModelMode, DataModelOptions } from '@neural/core/models/dataModel';
  import { resolveDataSourcePreview } from '@neural/render/utils/dataSourcePreview';
  import { fetchDataSource } from '@neural/render/utils/fetch';
  import { usePageNeuralStore } from '@neural/store';
  import { parseJson, pickByResponseField, resolveDataModelMode } from '@neural/store/dataSource';
  import type { Container, DataSource, LayoutSplitterNode } from '@neural/types';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import InputText from 'primevue/inputtext';
  import Select from 'primevue/select';
  import SelectButton from 'primevue/selectbutton';
  import type { TreeNode } from 'primevue/treenode';
  import TreeSelect from 'primevue/treeselect';
  import { computed, provide, ref, watch } from 'vue';

  interface Props {
    /** 数据模型配置，三种模式共用同一份扁平结构 */
    modelValue?: Partial<DataModelOptions> | null;
    name?: string;
    invalid?: boolean;
    disabled?: boolean;
    size?: 'small' | 'large';
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    size: 'small',
  });

  const emit = defineEmits<{ 'update:modelValue': [value: Partial<DataModelOptions>] }>();

  // 组件内部控件不继承外层 FormField 的 name，避免覆盖 dataModel 字段值
  provide('$pcFormField', { formControl: nestedFormControl });

  const pageNeuralStore = usePageNeuralStore();

  /** 三种获取方式 */
  const MODE_OPTIONS: { label: string; value: DataModelMode }[] = [
    { label: '引用', value: 'reference' },
    { label: '数据源', value: 'source' },
    { label: '自定义', value: 'custom' },
  ];

  /** 当前模式，空配置默认展示数据源 */
  const mode = computed<DataModelMode>(() => resolveDataModelMode(props.modelValue) || 'source');

  /** 合并新增字段后回写，保证双向绑定同步（同模式内更新时保留已有字段） */
  function emitPatch(patch: Partial<DataModelOptions>, nextMode: DataModelMode) {
    emit('update:modelValue', { ...props.modelValue, ...patch, mode: nextMode });
  }

  /** 切换模式：只保留当前模式对应的字段，清理其它模式的字段 */
  function onModeChange(value: DataModelMode) {
    const base = props.modelValue ?? {};
    const next: Partial<DataModelOptions> = { mode: value };
    if (value === 'reference') {
      next.referenceId = base.referenceId;
      next.responseField = base.responseField;
    } else if (value === 'source') {
      next.sourceId = base.sourceId;
      next.params = base.params;
      next.responseField = base.responseField;
    } else {
      next.customJson = base.customJson;
    }
    emit('update:modelValue', next);
  }

  /** 数据源模式下当前选中的数据源 */
  const sourceOptions = computed(() => pageNeuralStore.dataSources);

  const selectedSource = computed(() =>
    pageNeuralStore.dataSources.find((item) => item.id === props.modelValue?.sourceId)
  );

  /** http 数据源才需要请求参数与数据字段 */
  const isHttpSource = computed(() => selectedSource.value?.type === 'http');

  /** 数据源详情：json 显示 JSON 内容，http 显示 url */
  function sourceDetail(source: DataSource): string {
    return source.type === 'json' ? source.json || '' : source.url || '';
  }

  function onSourceChange(value: string | null) {
    emitPatch({ referenceId: '', sourceId: value || '' }, 'source');
  }

  function onParamsChange(value: Record<string, unknown>) {
    emitPatch({ params: value as Record<string, string> }, 'source');
  }

  function onResponseFieldChange(value?: string, nextMode: DataModelMode = 'source') {
    emitPatch({ responseField: value ?? '' }, nextMode);
  }

  /** 自定义模式的 JSON 校验提示，空值不提示 */
  const customJsonError = computed(() => {
    const text = props.modelValue?.customJson?.trim();
    if (!text) return '';
    try {
      JSON.parse(text);
      return '';
    } catch {
      return 'JSON 格式不正确';
    }
  });

  function onCustomJsonChange(value: string) {
    emitPatch({ customJson: value }, 'custom');
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

  /** 可选中节点的业务值 */
  interface NodeData {
    referenceId: string;
    sourceId: string;
  }

  /** key → 节点数据，用于把 TreeSelect 的选中 key 还原为业务值 */
  const nodeDataMap = new Map<string, NodeData>();

  /** 读取实体上的 dataModel 配置 */
  function getDataModel(entity: { props?: Record<string, unknown> }): DataModelOptions | undefined {
    return entity.props?.dataModel as DataModelOptions | undefined;
  }

  /**
   * 实体作为引用来源时的数据源 id
   * 返回 null 表示不可选择；返回空字符串表示数据可自给（自定义 / 引用链），无需数据源
   */
  function getSelectableSourceId(entity: { props?: Record<string, unknown> }): string | null {
    const dataModel = getDataModel(entity);
    const entityMode = resolveDataModelMode(dataModel);
    if (!dataModel || !entityMode) return null;
    if (entityMode === 'source') return dataModel.sourceId || null;
    if (entityMode === 'custom') return dataModel.customJson?.trim() ? '' : null;
    return dataModel.referenceId ? dataModel.sourceId || '' : null;
  }

  /** 生成层级节点：未配置数据来源的实体仍然展示，但不可选择 */
  function createEntityNode(
    entity: HierarchyEntity,
    keyPrefix: 'page' | 'container' | 'node',
    fallbackLabel: string,
    children: TreeNode[] = []
  ): TreeNode {
    const key = `${keyPrefix}:${entity.id}`;
    const sourceId = getSelectableSourceId(entity);

    if (sourceId !== null) {
      nodeDataMap.set(key, { referenceId: entity.id ?? '', sourceId });
    }

    return {
      key,
      label: entity.name || entity.title || fallbackLabel,
      selectable: sourceId !== null,
      children,
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

  /** 递归收集布局面板上挂载的所有容器 id */
  function collectContainerIds(splitter: LayoutSplitterNode): string[] {
    const ids: string[] = [];
    for (const panel of splitter.children) {
      if (panel.children.length) {
        for (const child of panel.children) {
          ids.push(...collectContainerIds(child));
        }
      } else if (panel.containerId) {
        ids.push(panel.containerId);
      }
    }
    return ids;
  }

  /** 页面 → 容器 → 节点（跳过布局层） */
  const treeOptions = computed<TreeNode[]>(() => {
    nodeDataMap.clear();
    const options: TreeNode[] = [];

    for (const page of pageNeuralStore.pages) {
      const layout = pageNeuralStore.layouts.find((item) => item.id === page.layoutId);
      const childContainers: TreeNode[] = [];

      if (layout) {
        const ancestors = new Set<string>();
        const added = new Set<string>();
        for (const containerId of collectContainerIds(layout)) {
          if (added.has(containerId)) continue;
          const container = pageNeuralStore.getContainer(containerId);
          if (!container) continue;
          childContainers.push(buildContainer(container, ancestors));
          added.add(containerId);
        }
      }

      options.push(createEntityNode(page, 'page', '未命名页面', childContainers));
    }

    return options;
  });

  /** TreeSelect 的选中 key 映射（单选模式仅一个 key） */
  const selectedKeys = ref<Record<string, boolean>>({});

  /** 根据外部选中值定位对应的树节点 key */
  function findKeyByValue(value?: Partial<DataModelOptions> | null): string | undefined {
    if (!value?.referenceId) return undefined;
    for (const [key, item] of nodeDataMap) {
      if (item.referenceId === value.referenceId && item.sourceId === (value.sourceId ?? ''))
        return key;
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
    const data = selectedKey ? nodeDataMap.get(selectedKey) : undefined;
    emitPatch(
      data
        ? { referenceId: data.referenceId, sourceId: data.sourceId }
        : { referenceId: '', sourceId: '' },
      'reference'
    );
  }

  /** 预览弹窗显隐 */
  const previewVisible = ref(false);

  /** 预览数据加载中 */
  const previewLoading = ref(false);

  /** 预览数据 */
  const previewData = ref<unknown>(null);

  /** 三种模式都可预览：引用看来源、数据源看选中数据源、自定义看 JSON */
  const canPreview = computed(() => {
    if (mode.value === 'reference') return !!props.modelValue?.referenceId;
    if (mode.value === 'source') return !!selectedSource.value;
    return !!props.modelValue?.customJson?.trim();
  });

  /** 预览内容序列化，空数据返回空字符串 */
  const previewText = computed(() => {
    if (previewData.value === null || previewData.value === undefined) return '';
    try {
      return JSON.stringify(previewData.value, null, 2);
    } catch {
      return String(previewData.value);
    }
  });

  /** 按数据模型从响应数据中解析行数据；自定义模式的数据已是最终结构，不应用 responseField */
  function resolveDataByDataModel(
    dataModel: DataModelOptions,
    data: unknown
  ): Record<string, unknown>[] {
    const mode = resolveDataModelMode(dataModel);
    let picked = data;

    if (mode !== 'custom') {
      picked = pickByResponseField(data, dataModel.responseField);
    }
    if (Array.isArray(picked)) return picked as Record<string, unknown>[];
    if (picked && typeof picked === 'object') return [picked as Record<string, unknown>];
    return [];
  }

  /** 按当前模式解析预览数据并打开弹窗 */
  async function openPreview() {
    const dataModel: DataModelOptions = { ...props.modelValue, mode: mode.value };
    previewData.value = null;
    previewVisible.value = true;

    // 引用：读取目标实体的原始数据（不应用引用源的 responseField），再按当前 responseField 提取
    if (mode.value === 'reference') {
      const referenced = resolveDataSourcePreview({
        originId: dataModel.referenceId ?? '',
        sourceId: dataModel.sourceId ?? '',
      });
      previewData.value = pickByResponseField(referenced, dataModel.responseField);
      return;
    }

    // 自定义：直接解析 JSON 并按数据模型规则转换
    if (mode.value === 'custom') {
      previewData.value = resolveDataByDataModel(dataModel, parseJson(dataModel.customJson));
      return;
    }

    // 数据源：拉取数据后按 responseField 解析为表格可用数据
    const source = selectedSource.value;
    if (!source) return;

    previewLoading.value = true;
    try {
      const raw = await fetchDataSource(source, dataModel.params || {});
      previewData.value = resolveDataByDataModel(dataModel, raw);
    } catch {
      previewData.value = null;
    } finally {
      previewLoading.value = false;
    }
  }
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex items-center gap-2">
      <SelectButton
        :model-value="mode"
        :options="MODE_OPTIONS"
        option-label="label"
        option-value="value"
        :size="size"
        :allow-empty="false"
        :disabled="disabled"
        class="min-w-0 flex-1"
        :form-control="nestedFormControl"
        @update:model-value="onModeChange"
      />

      <!-- 预览按钮：三种模式均可预览当前配置的数据 -->
      <Button
        text
        rounded
        :size="size"
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
        <div
          v-if="previewLoading"
          class="py-6 text-center text-xs text-gray-400 dark:text-gray-500"
        >
          正在加载数据...
        </div>
        <pre
          v-else-if="previewText"
          class="max-h-[60vh] overflow-auto rounded bg-gray-50 p-3 text-xs break-all whitespace-pre-wrap text-gray-700 dark:bg-gray-900 dark:text-gray-200"
          v-text="previewText"
        />
        <div v-else class="py-6 text-center text-xs text-gray-400 dark:text-gray-500">暂无数据</div>
      </Dialog>
    </div>

    <!-- 引用：页面 → 布局 → 容器 → 节点 -->
    <template v-if="mode === 'reference'">
      <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">选择来源</div>
      <TreeSelect
        :model-value="selectedKeys"
        :options="treeOptions"
        :name="name"
        :invalid="invalid"
        :disabled="disabled"
        :size="size"
        selection-mode="single"
        filter
        filter-placeholder="搜索页面 / 容器 / 节点"
        placeholder="使用已有页面/容器/组件的数据"
        empty-message="暂无可引用的数据"
        show-clear
        fluid
        scroll-height="18rem"
        class="min-w-0 flex-1"
        :form-control="nestedFormControl"
        @update:model-value="onSelectionChange"
      >
        <template #option="{ node }">
          <span :class="node.selectable === false ? 'text-gray-400 dark:text-gray-500' : ''">
            {{ node.label }}
          </span>
        </template>
      </TreeSelect>

      <div>
        <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">数据字段</div>
        <InputText
          :model-value="modelValue?.responseField || ''"
          placeholder="从引用数据中获取指定字段（可选）"
          fluid
          :size="size"
          :invalid="invalid"
          :disabled="disabled"
          :form-control="nestedFormControl"
          @update:model-value="(value) => onResponseFieldChange(value, 'reference')"
        />
      </div>
    </template>

    <!-- 数据源：选择数据源，http 类型可配置请求参数与数据字段 -->
    <template v-else-if="mode === 'source'">
      <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">选择接口</div>
      <Select
        :model-value="modelValue?.sourceId"
        :options="sourceOptions"
        option-label="name"
        option-value="id"
        filter
        :filter-fields="['name', 'url', 'json']"
        filter-placeholder="搜索数据源名称/URL/JSON..."
        auto-filter-focus
        reset-filter-on-hide
        empty-filter-message="未找到匹配的数据源"
        empty-message="暂无数据源"
        placeholder="请选择数据源"
        show-clear
        fluid
        :size="size"
        :invalid="invalid"
        :disabled="disabled"
        :form-control="nestedFormControl"
        @update:model-value="onSourceChange"
      >
        <!-- 选中项回显：名称、类型、method、url/json -->
        <template #value="{ placeholder }">
          <div v-if="selectedSource" class="flex min-w-0 items-center gap-2">
            <span class="text-sm font-medium text-gray-800 dark:text-gray-100">
              {{ selectedSource.name }}
            </span>
            <span
              class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ selectedSource.type?.toUpperCase() }}
            </span>
            <MethodTag v-if="selectedSource.method" :method="selectedSource.method" />
            <span
              v-if="sourceDetail(selectedSource)"
              class="truncate font-mono text-xs text-gray-400 dark:text-gray-500"
            >
              {{ sourceDetail(selectedSource) }}
            </span>
          </div>
          <span v-else class="text-gray-400 dark:text-gray-500">
            {{ placeholder || '请选择数据源' }}
          </span>
        </template>

        <!-- 选项：名称 + 类型徽标 + method + url/json -->
        <template #option="{ option }">
          <div class="flex min-w-0 flex-col gap-1 py-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-800 dark:text-gray-100">
                {{ option.name }}
              </span>
              <span
                class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ option.type?.toUpperCase() }}
              </span>
            </div>
            <div class="flex max-w-[500px] items-center gap-2">
              <MethodTag v-if="option.method" :method="option.method" />
              <span
                v-if="sourceDetail(option)"
                class="truncate font-mono text-xs text-gray-400 dark:text-gray-500"
              >
                {{ sourceDetail(option) }}
              </span>
            </div>
          </div>
        </template>
      </Select>

      <template v-if="isHttpSource">
        <div>
          <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">请求参数</div>
          <ObjectEditor
            :model-value="modelValue?.params || {}"
            placeholder="请求参数"
            :disabled="disabled"
            @update:model-value="onParamsChange"
          />
        </div>
        <div>
          <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">数据字段</div>
          <InputText
            :model-value="modelValue?.responseField || ''"
            placeholder="基于数据源的字段再进行解析"
            fluid
            :size="size"
            :invalid="invalid"
            :disabled="disabled"
            :form-control="nestedFormControl"
            @update:model-value="onResponseFieldChange"
          />
        </div>
      </template>
    </template>

    <!-- 自定义：CodeMirror 编辑 JSON -->
    <template v-else>
      <CodeMirror
        :model-value="modelValue?.customJson || ''"
        height="220px"
        :editable="!disabled"
        @update:model-value="onCustomJsonChange"
      />
      <small v-if="customJsonError" class="block text-xs text-red-500">{{ customJsonError }}</small>
    </template>
  </div>
</template>
