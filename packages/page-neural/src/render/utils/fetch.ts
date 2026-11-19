import {
  findDataModelByOriginId,
  pickByResponseField,
  resolveDataModelMode,
  type DataModelMode,
  type DataModelOptions,
} from '@neural/render/utils/shared';
import { useDataSourceStore } from '@neural/store/dataSource';
import type { DataSource } from '@neural/types';

// 从 shared.ts 重新导出，保持原有 API 不变
export type { DataModelMode, DataModelOptions };
export { findDataModelByOriginId, pickByResponseField, resolveDataModelMode };

/** 解析自定义 JSON，空值或非法 JSON 返回 null */
export function parseCustomJson(customJson?: string): unknown {
  if (!customJson?.trim()) return null;
  try {
    return JSON.parse(customJson);
  } catch {
    return null;
  }
}

/**
 * 请求数据源并返回解析后的数据
 * JSON 类型直接解析 json 字符串；HTTP 类型按配置发起请求
 * @param source 数据源配置
 * @param params 额外请求参数，同名字段覆盖数据源自身参数（如容器上配置的请求参数）
 * @returns JSON 数据或 HTTP 响应数据，非 JSON 响应返回原文
 */
export async function fetchDataSource(
  source: DataSource,
  params: Record<string, string> = {}
): Promise<unknown> {
  if (source.type === 'json') {
    if (!source.json) return null;
    try {
      return JSON.parse(source.json);
    } catch {
      throw new Error('JSON 数据源解析失败');
    }
  }

  const method = (source.method || 'GET').toUpperCase();
  // 支持相对路径（如 /api/xxx），基于当前站点 origin 补全
  if (!source.url) throw new Error('HTTP 数据源未配置请求地址');
  const url = new URL(source.url, window.location.origin);
  const headers: Record<string, string> = { ...source.headers };
  const requestParams = { ...source.params, ...params };

  let body: string | undefined;
  if (method === 'GET' || method === 'HEAD') {
    Object.entries(requestParams).forEach(([key, value]) => url.searchParams.append(key, value));
  } else {
    body = JSON.stringify(requestParams);
    if (!Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url.toString(), { method, headers, body });
  if (!response.ok) {
    throw new Error(`请求失败：${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    // 配置了响应字段则取对应路径的数据，否则返回完整响应
    return source.responseField
      ? getObjectValueByPath(parsed, source.responseField, parsed)
      : parsed;
  } catch {
    // 非 JSON 响应直接返回原文
    return text;
  }
}

// fetchDataSource 内部用到的工具，从 utils 引入
import { getObjectValueByPath } from '@neural/utils';

/**
 * 按容器 dataModel 从响应数据中解析行数据
 * 自定义模式的数据已是最终结构，不再应用 responseField；
 * 引用 / 数据源模式对传入 data 应用 responseField（若配置）
 * @param dataModel 容器上的数据模型配置
 * @param data fetchDataSource 返回的响应数据
 * @returns 可直接用于 DataTable 的行数组；无法解析为对象或数组时返回空数组
 */
export function resolveDataByDataModel(
  dataModel: DataModelOptions,
  data: unknown
): Record<string, unknown>[] {
  const mode = resolveDataModelMode(dataModel);
  const { responseField } = dataModel;
  let picked = data;

  if (mode !== 'custom') {
    picked = pickByResponseField(data, responseField);
  }
  if (Array.isArray(picked)) return picked as Record<string, unknown>[];
  if (picked && typeof picked === 'object') return [picked as Record<string, unknown>];
  return [];
}

/**
 * 基于容器 dataModel 获取数据，并将结果写入统一的数据源响应 store
 * - custom：解析 JSON 后写入 data
 * - reference：递归确保被引用实体已缓存，仅存 referenceId（读取时递归解析并应用每一跳 responseField）
 * - source+http：发起请求后存入原始响应；source+json：不发起请求，data 置空（读取时实时解析）
 * @param originId 发起请求的容器 / 组件 / 页面 id
 * @param dataModel 容器上的数据模型配置
 * @param dataSources 全局数据源列表（通常来自 store）
 */
export async function fetchByDataModel(
  originId: string,
  dataModel: DataModelOptions,
  dataSources: DataSource[]
): Promise<void> {
  const mode = resolveDataModelMode(dataModel);
  const dataSourceStore = useDataSourceStore();

  if (!mode) {
    dataSourceStore.setCustom(originId, null);
    return;
  }

  // 自定义：解析 JSON 并缓存
  if (mode === 'custom') {
    dataSourceStore.setCustom(originId, parseCustomJson(dataModel.customJson));
    return;
  }

  // 引用：先递归确保被引用实体的数据已缓存，再只存 referenceId
  if (mode === 'reference') {
    const referencedModel = findDataModelByOriginId(dataModel.referenceId);
    if (referencedModel) {
      await fetchByDataModel(dataModel.referenceId!, referencedModel, dataSources);
    }
    dataSourceStore.setReference(originId, dataModel.referenceId);
    return;
  }

  // source 模式
  const source = dataSources.find((item) => item.id === dataModel.sourceId);
  if (!source) {
    dataSourceStore.setSource(originId, dataModel.sourceId, null);
    return;
  }

  if (source.type === 'http') {
    try {
      const raw = await fetchDataSource(source, dataModel.params || {});
      dataSourceStore.setSource(originId, dataModel.sourceId, raw);
    } catch {
      dataSourceStore.setSource(originId, dataModel.sourceId, null);
    }
  } else {
    // JSON 数据源不发请求，data 置空；读取时由 store.getResponse 实时解析
    dataSourceStore.setSource(originId, dataModel.sourceId, null);
  }
}
