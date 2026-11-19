import { usePageNeuralStore } from '@neural/store';
import { useDataSourceStore } from '@neural/store/dataSource';
import type { DataSource } from '@neural/types';

import { findDataModelByOriginId, resolveDataByDataModel } from './fetch';

/** 数据源选择值 */
export interface DataSourcePreviewSelection {
  /** 发起请求的容器 / 组件 / 页面 id；JSON 数据源为空字符串 */
  originId: string;
  /** 数据源 id */
  sourceId: string;
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
 * 解析数据源选择值对应的预览数据
 * JSON 数据源返回解析后的 JSON；层级来源返回按 dataModel 解析后的表格数据
 */
export function resolveDataSourcePreview(selection: DataSourcePreviewSelection): unknown {
  const pageNeuralStore = usePageNeuralStore();

  // JSON 数据源没有请求方，直接解析配置中的 JSON 字符串
  if (!selection.originId) {
    const source = pageNeuralStore.dataSources.find((item) => item.id === selection.sourceId);
    return parseJsonSource(source);
  }

  // 层级来源：取统一 store 中缓存的响应，再按该实体的 dataModel 解析
  const dataSourceStore = useDataSourceStore();
  const response = dataSourceStore.getResponse(selection.originId, selection.sourceId);
  return resolveDataByDataModel(findDataModelByOriginId(selection.originId) ?? {}, response?.data);
}
