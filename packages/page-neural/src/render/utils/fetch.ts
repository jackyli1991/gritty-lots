import type { DataSource } from '@neural/types';
import { getObjectValueByPath } from '@neural/utils';

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
