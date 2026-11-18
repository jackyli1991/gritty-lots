import { useDataSourceStore } from '@neural/store/dataSource';
import type { DataSource } from '@neural/types';
import { getObjectValueByPath } from '@neural/utils';

/**
 * 数据模型配置（容器 props.dataModel 的结构）
 */
export interface DataModelOptions {
  enable?: boolean;
  sourceId?: string;
  params?: Record<string, string>;
  /** 容器级响应字段，基于数据源自身 responseField 进行解析，若未配置则返回完整响应数据 */
  responseField?: string;
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

/**
 * 按容器 dataModel 从响应数据中解析行数据
 * @param dataModel 容器上的数据模型配置
 * @param data fetchDataSource 返回的响应数据
 * @returns 可直接用于 DataTable 的行数组；无法解析为对象或数组时返回空数组
 */
export function resolveDataByDataModel(
  dataModel: DataModelOptions,
  data: unknown
): Record<string, unknown>[] {
  const { responseField } = dataModel;
  let picked = data;

  if (responseField && data && typeof data === 'object') {
    picked = getObjectValueByPath(data as Record<string, unknown>, responseField, data);
  }
  if (Array.isArray(picked)) return picked as Record<string, unknown>[];
  if (picked && typeof picked === 'object') return [picked as Record<string, unknown>];
  return [];
}

/**
 * 基于容器 dataModel 请求数据，并将原始响应写入统一的数据源响应 store
 * @param originId 发起请求的容器 / 组件 / 页面 id
 * @param dataModel 容器上的数据模型配置
 * @param dataSources 全局数据源列表（通常来自 store）
 */
export async function fetchByDataModel(
  originId: string,
  dataModel: DataModelOptions,
  dataSources: DataSource[]
): Promise<void> {
  const { enable, sourceId, params } = dataModel;
  const dataSourceStore = useDataSourceStore();
  const cacheResponse = (data: unknown) => {
    dataSourceStore.setResponse({ originId, sourceId: sourceId || '', data });
  };

  if (!enable || !sourceId) {
    cacheResponse(null);
    return;
  }

  const source = dataSources.find((item) => item.id === sourceId);
  if (!source) {
    cacheResponse(null);
    return;
  }

  try {
    const raw = await fetchDataSource(source, params || {});
    cacheResponse(raw);
  } catch {
    cacheResponse(null);
  }
}
