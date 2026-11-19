import { findDataModelByOriginId, pickByResponseField } from '@neural/render/utils/shared';
import { usePageNeuralStore } from '@neural/store';
import type { DataSource } from '@neural/types';
import { defineStore } from 'pinia';

/** 三种缓存模式，与 fetch.ts 的 DataModelMode 保持一致 */
type CacheMode = 'reference' | 'source' | 'custom';

/** 容器 / 组件 / 页面请求后的数据源响应记录 */
export interface DataSourceResponse {
  /** 发起请求的容器 / 组件 / 页面 id */
  originId: string;
  /** 数据源 id（reference 模式为空） */
  sourceId: string;
  /** 解析后的数据 */
  data: unknown;
}

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

/** 解析 JSON 数据源的 json 字符串，非法 JSON 返回 null */
function parseJsonSource(source?: DataSource): unknown {
  if (!source?.json) return null;
  try {
    return JSON.parse(source.json);
  } catch {
    return null;
  }
}

/**
 * 递归解析引用链：沿 reference 链路遍历到落点实体，返回该实体经 dataModel.responseField 解析后的数据。
 * 每一跳都对目标实体的 dataModel.responseField 应用一次，使中间容器的响应字段也生效。
 */
function resolveCachedData(
  state: Record<string, DataSourceResponseEntry>,
  originId: string,
  visited: Set<string>
): unknown {
  if (!originId || visited.has(originId)) return null;
  visited.add(originId);

  const entry = state[originId];
  if (!entry) return null;

  if (entry.mode === 'reference') {
    // 先递归拿到被引用实体的数据，再对当前实体应用其 dataModel.responseField
    const rawReferenced = resolveCachedData(state, entry.referenceId!, visited);
    const refModel = findDataModelByOriginId(originId);
    return pickByResponseField(rawReferenced, refModel?.responseField);
  }

  if (entry.mode === 'source') {
    const source = usePageNeuralStore().dataSources.find((item) => item.id === entry.sourceId);
    if (source?.type === 'json') {
      // JSON 数据源不缓存，实时从配置解析
      const json = parseJsonSource(source);
      // 再对当前实体的 dataModel.responseField 应用一次
      const currentModel = findDataModelByOriginId(originId);
      return pickByResponseField(json, currentModel?.responseField);
    }
    // HTTP 数据源返回原始响应（已由 fetchDataSource 应用 source 自身 responseField）
    // 再对当前实体的 dataModel.responseField 应用一次
    const currentModel = findDataModelByOriginId(originId);
    return pickByResponseField(entry.data, currentModel?.responseField);
  }

  // custom：解析后的 JSON 直接返回（自定义模式不应用 responseField）
  return entry.data;
}

/** 按请求方 id 缓存接口响应；读取时递归解析引用链并应用每一跳的 responseField，JSON 数据源直接从配置解析 */
export const useDataSourceStore = defineStore('page-neural-data-source', {
  state: () => ({
    /** 以 originId 为键，值为带 mode 的条目 */
    responses: {} as Record<string, DataSourceResponseEntry>,
  }),
  getters: {
    getResponse:
      (state) =>
      (originId: string, sourceId = ''): DataSourceResponse | undefined => {
        const entry = state.responses[originId];
        if (!entry) return undefined;

        // 数据源一致性校验：source 模式下请求的 sourceId 必须匹配
        if (entry.mode === 'source' && sourceId && entry.sourceId !== sourceId) {
          return undefined;
        }

        const data = resolveCachedData(state.responses, originId, new Set());
        return { originId, sourceId: sourceId || entry.sourceId || '', data };
      },
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
  },
});
