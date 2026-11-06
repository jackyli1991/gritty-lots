<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import CodeMirror from '@neural/components/codeMirror';
  import type { OpenModal } from '@neural/composables/userModal';
  import MethodTag from '@neural/core/components/MethodTag.vue';
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import { createRequest } from '@neural/core/forms/request';
  import { usePageNeuralStore } from '@neural/store';
  import type { DataSource } from '@neural/types';
  import { getObjectValueByPath, generateId } from '@neural/utils';
  import Button from 'primevue/button';
  import Tag from 'primevue/tag';
  import { computed, ref, watch, inject } from 'vue';

  // 数据源配置面板：顶部添加按钮，左侧数据源列表，右侧数据预览（JSON 直接预览 / HTTP 请求结果）
  // 作为弹窗 connectedComponent 渲染，弹窗会透传 data 等表单属性，此处不需要，禁止继承到根元素
  defineOptions({ name: 'DatabasePanel', inheritAttrs: false });

  // 由最外层 core/index.vue 注入，此处不再创建独立弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  const pageNeuralStore = usePageNeuralStore();
  const { neuralConfirm } = useNeuralConfirm();
  const dataSources = computed(() => pageNeuralStore.dataSources);

  // 当前选中的数据源
  const activeId = ref('');
  const activeSource = computed(
    () => dataSources.value.find((item) => item.id === activeId.value) ?? null
  );

  // 顶部添加：复用请求配置弹窗，提交后写入 store 并选中新数据源
  function addDataSource() {
    const requestForm = createRequest();
    openModal?.({
      key: 'request',
      props: requestForm,
      formConfig: {
        submitText: '新增',
        onSubmit: (data: DataSource) => {
          const dataSource: DataSource = {
            id: generateId('d'),
            ...data,
          };
          pageNeuralStore.addDataSource(dataSource);
          activeId.value = dataSource.id as string;
        },
      },
    });
  }

  // 编辑：复用请求配置弹窗，以选中数据为初始值，提交后按 id 原地更新并保持选中
  function editDataSource(item: DataSource) {
    openModal?.({
      key: 'request',
      props: { ...item },
      nodeData: item,
      formConfig: {
        submitText: '保存',
        onSubmit: (data: DataSource) => {
          const dataSource: DataSource = { ...item, ...data, id: item.id };
          pageNeuralStore.updateDataSource(dataSource);
          activeId.value = item.id ?? '';
        },
      },
    });
  }

  // 删除：二次确认后移除，若删除的是选中项则重置选中并丢弃进行中的请求结果
  function deleteDataSource(item: DataSource, event: Event) {
    console.log(item, event);
    neuralConfirm({
      target: event.currentTarget as HTMLElement,
      message: `确认删除数据源【${item.name || '未命名'}】吗？`,
      type: 'delete',
      confirm: () => {
        if (!item.id) return;
        pageNeuralStore.deleteDataSource(item.id);
        if (activeId.value !== item.id) return;
        // 使进行中的请求结果失效
        requestSeq += 1;
        loading.value = false;
        errorMessage.value = '';
        responsePreview.value = '';
        activeId.value = dataSources.value[0]?.id ?? '';
      },
    });
  }

  // ---------- 右侧预览 ----------

  // JSON 类型：直接格式化预览，解析失败时展示原文
  const jsonPreview = computed(() => {
    if (activeSource.value?.type !== 'json') return '';
    const raw = activeSource.value.json || '';
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  });

  // HTTP 类型：按配置请求接口后的响应预览
  const loading = ref(false);
  const errorMessage = ref('');
  const responsePreview = ref('');

  // 请求序号：快速切换数据源时丢弃过期响应，避免旧结果覆盖新结果
  let requestSeq = 0;

  async function fetchSource(source: DataSource) {
    const seq = ++requestSeq;
    loading.value = true;
    errorMessage.value = '';
    responsePreview.value = '';

    try {
      const method = (source.method || 'GET').toUpperCase();
      // 支持相对路径（如 /api/xxx），基于当前站点 origin 补全
      const url = new URL(source.url, window.location.origin);
      const headers: Record<string, string> = { ...source.headers };

      let body: string | undefined;
      if (method === 'GET' || method === 'HEAD') {
        Object.entries(source.params || {}).forEach(([key, value]) =>
          url.searchParams.append(key, value)
        );
      } else {
        body = JSON.stringify(source.params || {});
        if (!Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
          headers['Content-Type'] = 'application/json';
        }
      }

      const response = await fetch(url.toString(), { method, headers, body });
      if (seq !== requestSeq) return;
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let pretty = text;
      try {
        const parsed = JSON.parse(text);
        // 配置了响应字段则取对应路径的数据，否则展示完整响应
        const picked = source.responseField
          ? getObjectValueByPath(parsed, source.responseField, parsed)
          : parsed;
        pretty = typeof picked === 'string' ? picked : JSON.stringify(picked, null, 2);
      } catch {
        // 非 JSON 响应直接展示原文
      }

      if (seq !== requestSeq) return;
      responsePreview.value = pretty;
    } catch (error) {
      if (seq !== requestSeq) return;
      errorMessage.value = error instanceof Error ? error.message : String(error);
    } finally {
      if (seq === requestSeq) loading.value = false;
    }
  }

  // 选中 HTTP 数据源时自动按配置发起请求
  watch(
    activeSource,
    (source) => {
      if (source?.type === 'http') fetchSource(source);
    },
    { immediate: true }
  );
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-2">
    <!-- 顶部：添加按钮 -->
    <div class="flex shrink-0 items-center justify-between">
      <span class="text-xs text-gray-500 dark:text-gray-400">
        共 {{ dataSources.length }} 个数据源
      </span>
      <Button size="small" @click="addDataSource">
        <NeuralIcon name="Plus" :size="14" />
        <span class="ml-1">添加</span>
      </Button>
    </div>

    <div class="flex min-h-0 flex-1 gap-2">
      <!-- 左侧：已配置数据源列表 -->
      <div
        class="flex w-56 shrink-0 flex-col gap-1 overflow-auto rounded-md border border-gray-200 p-1 dark:border-gray-700"
      >
        <div
          v-for="item in dataSources"
          :key="item.id"
          class="group flex cursor-pointer flex-col gap-0.5 rounded px-2 py-1.5 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          :class="
            activeId === item.id
              ? 'bg-gray-100 text-(--p-primary-500) dark:bg-gray-800'
              : 'text-gray-600 dark:text-gray-300'
          "
          @click="activeId = item.id ?? ''"
        >
          <div class="flex items-center gap-1.5">
            <NeuralIcon :name="item.type === 'json' ? 'FileJson2' : 'Globe'" :size="13" />
            <span class="truncate font-medium">{{ item.name || '未命名' }}</span>
            <!-- 操作按钮：hover 才显示，@click.stop 避免触发选中 -->
            <div
              class="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <button
                type="button"
                class="flex size-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-(--p-primary-500) dark:hover:bg-gray-700"
                title="编辑"
                @click.stop="editDataSource(item)"
              >
                <NeuralIcon name="Pencil" :size="12" />
              </button>
              <button
                type="button"
                class="flex size-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-500 dark:hover:bg-gray-700"
                title="删除"
                @click.stop="deleteDataSource(item, $event)"
              >
                <NeuralIcon name="Trash2" :size="12" />
              </button>
            </div>
            <Tag
              :severity="item.type === 'json' ? 'success' : 'info'"
              :value="item.type.toUpperCase()"
              :pt="{ root: { style: { padding: '0 4px', fontSize: '10px' } } }"
            />
          </div>
          <!-- 第二行：HTTP 展示请求方法与地址，JSON 展示 JSON 字符串（单行超出隐藏） -->
          <div
            v-if="item.type === 'http' || item.type === 'json'"
            class="flex min-w-0 items-center gap-1 truncate text-[11px] text-gray-400 dark:text-gray-500"
          >
            <template v-if="item.type === 'http'">
              <MethodTag :method="item.method" />
              <span class="truncate">{{ item.url || '-' }}</span>
            </template>
            <span v-else class="truncate">{{ item.json || '-' }}</span>
          </div>
        </div>
        <!-- 空态 -->
        <div
          v-if="!dataSources.length"
          class="flex flex-col items-center gap-1 py-6 text-xs text-gray-400 dark:text-gray-500"
        >
          <NeuralIcon name="Database" :size="20" />
          <span>暂无数据源，点击右上角添加</span>
        </div>
      </div>

      <!-- 右侧：数据预览 -->
      <div
        class="flex min-w-0 flex-1 flex-col gap-1.5 overflow-hidden rounded-md border border-gray-200 p-2 dark:border-gray-700"
      >
        <template v-if="activeSource">
          <div class="flex shrink-0 items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <NeuralIcon :name="activeSource.type === 'json' ? 'FileJson2' : 'Globe'" :size="13" />
            <span class="truncate font-medium text-gray-700 dark:text-gray-200">
              {{ activeSource.name }}
            </span>
            <template v-if="activeSource.type === 'http'">
              <span class="truncate"
                >{{ activeSource.method || 'GET' }} {{ activeSource.url }}</span
              >
              <button
                class="ml-auto shrink-0 text-gray-400 transition-colors hover:text-(--p-primary-500)"
                title="重新请求"
                @click="fetchSource(activeSource)"
              >
                <NeuralIcon name="RefreshCw" :size="13" />
              </button>
            </template>
          </div>

          <!-- 预览区：占满剩余高度，内容内部滚动；cm-editor 撑满容器后由 CodeMirror 自身滚动 -->
          <div class="min-h-0 flex-1 overflow-hidden [&_.cm-editor]:h-full">
            <!-- JSON 类型：直接预览 -->
            <CodeMirror
              v-if="activeSource.type === 'json'"
              :model-value="jsonPreview"
              :editable="false"
              height="100%"
            />

            <!-- HTTP 类型：加载中 / 错误 / 响应数据 -->
            <template v-else>
              <div
                v-if="loading"
                class="flex h-full flex-col items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500"
              >
                <NeuralIcon name="LoaderCircle" :size="20" class="animate-spin" />
                <span>请求中...</span>
              </div>
              <div
                v-else-if="errorMessage"
                class="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-red-500 dark:text-red-400"
              >
                <NeuralIcon name="CircleAlert" :size="20" />
                <span>{{ errorMessage }}</span>
              </div>
              <CodeMirror v-else :model-value="responsePreview" :editable="false" height="100%" />
            </template>
          </div>
        </template>

        <!-- 未选中 -->
        <div
          v-else
          class="flex h-full flex-col items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500"
        >
          <NeuralIcon name="MousePointerClick" :size="20" />
          <span>点击左侧数据源查看数据</span>
        </div>
      </div>
    </div>
  </div>
</template>
