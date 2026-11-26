import type { DataModelOptions } from '@neural/core/models/dataModel';
import { usePageNeuralStore } from '@neural/store';
import { useDataSourceStore } from '@neural/store/dataSource';
import type { Container } from '@neural/types';
import { useDebounceFn } from '@vueuse/core';
import type { ComputedRef, MaybeRef } from 'vue';
import { computed, ref, unref, watch } from 'vue';

interface UseDataOptions {
  /** 直接指定数据模型配置；不传时取容器 props.dataModel（用于第一个参数不是容器 id 的场景） */
  dataModel?: MaybeRef<DataModelOptions | undefined>;
  /** 是否自动监听 dataModel 变化并加载数据（默认 true）；容器统一入口使用默认值，子容器读取时传 false */
  autoLoad?: boolean;
  /** 防抖等待时间，毫秒，默认 300 */
  debounceMs?: number;
}

interface UseDataReturn {
  /** 容器实例 */
  container: ComputedRef<Container | undefined>;
  /** 容器上的数据模型配置 */
  dataModel: ComputedRef<DataModelOptions>;
  /** 发起请求的实体 id（容器 id） */
  originId: ComputedRef<string>;
  /** 已解析的数据（从 store 缓存中读取并按 responseField 转换，无缓存时为 null） */
  data: ComputedRef<Record<string, unknown> | null>;
  /** 加载中 */
  loading: ReturnType<typeof ref<boolean>>;
  /** 手动触发一次数据加载（会写入统一数据源 store），params 会覆盖 dataModel.params 的同名字段 */
  loadData: (params?: Record<string, any>) => Promise<void>;
}

/**
 * 容器数据加载与获取的统一组合函数。
 * - 自动从 store 查找容器、dataModel，并按三模式取数写入统一缓存。
 * - 暴露 data 供容器（table / form / drawer 等）直接使用。
 * - 默认启用防抖 + 竞态保护 + 立即执行，容器统一入口 index.vue 使用默认配置；
 *   子容器（table.vue 等）仅消费数据时传 { autoLoad: false }，避免重复请求。
 */
export function useData(
  containerId: MaybeRef<string | undefined>,
  options: UseDataOptions = {}
): UseDataReturn {
  const { autoLoad = true, debounceMs = 300 } = options;

  const pageNeuralStore = usePageNeuralStore();
  const dataSourceStore = useDataSourceStore();

  /** 容器实例 */
  const container = computed(() => pageNeuralStore.getContainer(unref(containerId) || ''));

  /** 数据模型配置：优先使用外部传入，否则取容器上的配置 */
  const dataModel = computed<DataModelOptions>(
    () => unref(options.dataModel) ?? (container.value?.props.dataModel || {})
  );

  /** 发起请求的实体 id，回退到外部传入的 id */
  const originId = computed(() => container.value?.id ?? unref(containerId) ?? '');

  /** 已解析的数据 */
  const data = computed(() => dataSourceStore.getDataByModel(originId.value, dataModel.value));

  /** 加载状态（每次手动 load 时置为 true） */
  const loading = ref(false);

  // 竞态保护：丢弃过期请求结果
  let requestSeq = 0;

  /** 向统一 store 写入数据 */
  async function loadData(params?: Record<string, string>): Promise<void> {
    const seq = ++requestSeq;
    loading.value = true;
    try {
      await dataSourceStore.fetchDataByModel(originId.value, dataModel.value, params);
    } finally {
      if (seq === requestSeq) loading.value = false;
    }
  }

  // 监听 dataModel 变化，立即一次 + 后续防抖
  if (autoLoad) {
    const debouncedLoad = useDebounceFn(loadData, debounceMs);
    let firstRun = true;

    watch(
      dataModel,
      () => {
        if (firstRun) {
          firstRun = false;
          loadData();
        } else {
          debouncedLoad();
        }
      },
      { immediate: true, deep: true }
    );
  }

  return { container, dataModel, originId, data, loading, loadData };
}
