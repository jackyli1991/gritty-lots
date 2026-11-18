import { usePageNeuralStore } from '@neural/store';
import { useDataSourceStore } from '@neural/store/dataSource';
import type { DataSource } from '@neural/types';

import { resolveDataByDataModel } from './fetch';
import type { DataModelOptions } from './fetch';

/** 数据源选择值 */
export interface DataSourcePreviewSelection {
  /** 发起请求的容器 / 组件 / 页面 id；JSON 数据源为空字符串 */
  originId: string;
  /** 数据源 id */
  sourceId: string;
}

/** store 中的 nodes 暂无强类型，预览时只读取 id 与 dataModel */
interface HierarchyNode {
  id?: string;
  props?: Record<string, unknown>;
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

/** 从页面 / 容器 / 节点中查找指定 id 的 dataModel 配置 */
function findDataModel(originId: string): DataModelOptions | undefined {
  const store = usePageNeuralStore();

  const page = store.pages.find((item) => item.id === originId);
  if (page) return page.props?.dataModel as DataModelOptions | undefined;

  const container = store.getContainer(originId);
  if (container) return container.props?.dataModel as DataModelOptions | undefined;

  const node = (store.nodes as unknown as HierarchyNode[]).find((item) => item.id === originId);
  return node?.props?.dataModel as DataModelOptions | undefined;
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
  return resolveDataByDataModel(findDataModel(selection.originId) ?? {}, response?.data);
}
