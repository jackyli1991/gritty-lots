import type { DataModelOptions } from '@neural/core/models/dataModel';
import { fetchDataSource } from '@neural/render/utils/fetch';
import { pickByResponseField, resolveDataModelMode } from '@neural/render/utils/shared';
import { usePageNeuralStore } from '@neural/store';
import { defineStore } from 'pinia';

// 从 shared.ts 重新导出，统一由本模块对外提供数据模型相关工具与类型
export { pickByResponseField, resolveDataModelMode };

/** 三种缓存模式 */
type CacheMode = 'reference' | 'source' | 'custom';

/** 缓存条目，以 originId 为键存储，按 mode 携带不同的附加信息 */
interface DataSourceResponseEntry {
  mode: CacheMode;
  /** reference 模式：被引用实体 id */
  referenceId?: string;
  /** source 模式：数据源 id */
  sourceId?: string;
  /** custom 模式：解析后的 JSON；source 模式 + http 为原始响应；reference / source+json 均为 null */
  data: unknown;
}

/** 解析 JSON，空值或非法 JSON 返回 null */
export function parseJson(json?: string): unknown {
  if (!json?.trim()) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** 读取条目的原始数据：source 模式实时从数据源配置解析或返回缓存的原始响应；custom 直接返回缓存数据 */
function getEntryRawData(entry: DataSourceResponseEntry): unknown {
  if (entry.mode !== 'source') return entry.data;
  const source = usePageNeuralStore().dataSources.find((item) => item.id === entry.sourceId);
  return source?.type === 'json' ? parseJson(source.json) : entry.data;
}

/**
 * 取引用链落点实体的原始数据：只沿 reference 链路向下，
 * 不应用引用源（含中间跳）的 responseField
 */
function resolveReferenceData(
  state: Record<string, DataSourceResponseEntry>,
  originId: string,
  visited: Set<string>
): unknown {
  if (!originId || visited.has(originId)) return null;
  visited.add(originId);

  const entry = state[originId];
  if (!entry) return null;

  if (entry.mode === 'reference') {
    return resolveReferenceData(state, entry.referenceId!, visited);
  }
  return getEntryRawData(entry);
}

/**
 * 解析指定实体的数据
 * - reference：只取引用源的原始数据，不应用引用源的 responseField，仅应用当前实体自己的 responseField
 * - source：应用当前实体的 responseField（JSON 实时解析 / HTTP 使用原始响应）
 * - custom：解析后的 JSON 直接返回（自定义模式不应用 responseField）
 * dataModel 由调用方（getDataByModel）直接传入，不再反查 store
 */
function resolveCachedData(
  state: Record<string, DataSourceResponseEntry>,
  originId: string,
  dataModel: DataModelOptions,
  visited: Set<string>
): any {
  if (!originId || visited.has(originId)) return null;
  visited.add(originId);

  const entry = state[originId];
  if (!entry) return null;

  if (entry.mode === 'reference') {
    const rawReferenced = resolveReferenceData(state, entry.referenceId!, visited);
    return pickByResponseField(rawReferenced, dataModel.responseField);
  }

  if (entry.mode === 'source') {
    return pickByResponseField(getEntryRawData(entry), dataModel.responseField);
  }

  // custom：解析后的 JSON 直接返回
  return entry.data;
}

/**
 * 数据源响应缓存与取数入口
 * - 查询：fetchDataByModel 按 dataModel 拉取数据并写入缓存
 * - 获取：getDataByModel 读取缓存，递归解析引用链后按 dataModel 直接返回最终行数据
 */
export const useDataSourceStore = defineStore('page-neural-data-source', {
  state: () => ({
    /** 以 originId 为键，值为带 mode 的条目 */
    responses: {} as Record<string, DataSourceResponseEntry>,
  }),
  getters: {
    /**
     * 按 originId 读取缓存，递归解析引用链后再按 dataModel 解析为最终行数据
     * @param originId 发起请求的容器 / 组件 / 页面 id
     * @param dataModel 容器上的数据模型配置
     * @returns 可直接用于 DataTable 的行数组；无缓存或数据源不匹配时返回 null
     */
    getDataByModel:
      (state) =>
      (originId: string, dataModel: DataModelOptions = {}): any => {
        const entry = state.responses[originId];
        if (!entry) return null;

        // 数据源一致性校验：source 模式下请求的 sourceId 必须匹配
        if (
          entry.mode === 'source' &&
          dataModel.sourceId &&
          entry.sourceId !== dataModel.sourceId
        ) {
          return null;
        }
        // resolveCachedData 已按每一跳的 responseField 解析
        const data = resolveCachedData(state.responses, originId, dataModel, new Set());
        console.log('getData------------>', originId, dataModel, data);
        return data;
      },

    /**
     * 读取原始数据：沿引用链向下，不应用任何实体的 responseField
     * @param originId 容器 / 组件 / 页面 id
     */
    getRawData:
      (state) =>
      (originId: string): unknown =>
        resolveReferenceData(state.responses, originId, new Set()),
  },
  actions: {
    /** 自定义模式 */
    setCustom(originId: string, data: unknown) {
      this.responses[originId] = { mode: 'custom', data };
    },

    /** 引用模式：只存 referenceId，不存实际数据 */
    setReference(originId: string, referenceId: string | undefined) {
      this.responses[originId] = { mode: 'reference', referenceId, data: null };
    },

    /** 数据源模式：sourceId + data（JSON 数据源传 null） */
    setSource(originId: string, sourceId: string | undefined, data: unknown) {
      this.responses[originId] = { mode: 'source', sourceId, data };
    },

    /**
     * 基于容器 dataModel 查询数据，并将结果写入缓存
     * - custom：解析 JSON 后写入 data
     * - reference：递归确保被引用实体已缓存，仅存 referenceId（读取时递归解析并应用每一跳 responseField）
     * - source+http：发起请求后存入原始响应；source+json：不发起请求，data 置空（读取时实时解析）
     * @param originId 发起请求的容器 / 组件 / 页面 id
     * @param dataModel 容器上的数据模型配置
     * @param params 额外请求参数，同名字段覆盖 dataModel.params
     */
    async fetchDataByModel(
      originId: string,
      dataModel: DataModelOptions,
      params: Record<string, string> = {}
    ): Promise<void> {
      const mode = resolveDataModelMode(dataModel);
      console.log('fetchData------------>', mode);

      if (!mode) {
        this.setCustom(originId, null);
        return;
      }

      // 自定义：解析 JSON 并缓存
      if (mode === 'custom') {
        this.setCustom(originId, parseJson(dataModel.customJson));
        return;
      }

      // 引用：只存 referenceId
      if (mode === 'reference') {
        this.setReference(originId, dataModel.referenceId);
        return;
      }

      // source 模式
      const source = usePageNeuralStore().dataSources.find(
        (item) => item.id === dataModel.sourceId
      );
      if (!source) {
        this.setSource(originId, dataModel.sourceId, null);
        return;
      }

      if (source.type === 'http') {
        try {
          const raw = await fetchDataSource(source, { ...dataModel.params, ...params });
          this.setSource(originId, dataModel.sourceId, raw);
        } catch {
          this.setSource(originId, dataModel.sourceId, null);
        }
      } else {
        // JSON 数据源不发请求，data 置空；读取时由 getDataByModel 实时解析
        this.setSource(originId, dataModel.sourceId, null);
      }
    },
  },
});
