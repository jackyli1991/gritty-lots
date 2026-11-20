import { usePageNeuralStore } from '@neural/store';
import { useDataSourceStore } from '@neural/store/dataSource';
import type { DataSource } from '@neural/types';

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
 * JSON 数据源返回解析后的 JSON；层级来源返回引用目标的原始数据（不应用引用源的 responseField）
 */
export function resolveDataSourcePreview(selection: DataSourcePreviewSelection): unknown {
  const pageNeuralStore = usePageNeuralStore();

  // JSON 数据源没有请求方，直接解析配置中的 JSON 字符串
  if (!selection.originId) {
    const source = pageNeuralStore.dataSources.find((item) => item.id === selection.sourceId);
    return parseJsonSource(source);
  }

  // 层级来源：取引用链落点实体的原始数据，由调用方再按当前实体的 responseField 解析
  return useDataSourceStore().getRawData(selection.originId);
}
