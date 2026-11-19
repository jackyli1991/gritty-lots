import { usePageNeuralStore } from '@neural/store';
import { getObjectValueByPath } from '@neural/utils';

/** 数据模型的获取方式，与 fetch.ts 保持一致 */
export type DataModelMode = 'reference' | 'source' | 'custom';

/** 数据模型配置的扁平字段（共享定义，避免 fetch ↔ store 循环依赖） */
export interface DataModelOptions {
  /** 获取方式；缺省时按已有字段推断 */
  mode?: DataModelMode;
  /** 仅兼容旧数据：enable + sourceId 视为数据源模式 */
  enable?: boolean;
  /** 引用模式：来源页面 / 容器 / 节点 id */
  referenceId?: string;
  /** 数据源模式：数据源 id */
  sourceId?: string;
  /** 数据源模式：请求参数 */
  params?: Record<string, string>;
  /** 引用 / 数据源模式：响应字段路径 */
  responseField?: string;
  /** 自定义模式：JSON 字符串 */
  customJson?: string;
}

/** store 中的 nodes 暂无强类型，查找 dataModel 时只读取 id 与 props */
interface HierarchyNode {
  id?: string;
  props?: Record<string, unknown>;
}

/** 解析数据模型的获取方式 */
export function resolveDataModelMode(dataModel?: DataModelOptions | null): DataModelMode | '' {
  if (!dataModel) return '';
  if (dataModel.mode) return dataModel.mode;
  if (dataModel.sourceId) return 'source';
  if (dataModel.customJson) return 'custom';
  if (dataModel.referenceId) return 'reference';
  return '';
}

/** 在页面 / 容器 / 节点中查找指定 id 的 dataModel */
export function findDataModelByOriginId(originId?: string): DataModelOptions | undefined {
  if (!originId) return undefined;

  const store = usePageNeuralStore();

  const page = store.pages.find((item) => item.id === originId);
  if (page) return page.props?.dataModel as DataModelOptions | undefined;

  const container = store.getContainer(originId);
  if (container) return container.props?.dataModel as DataModelOptions | undefined;

  const node = (store.nodes as unknown as HierarchyNode[]).find((item) => item.id === originId);
  return node?.props?.dataModel as DataModelOptions | undefined;
}

/** 按 responseField 从数据中提取指定字段；未配置或数据非对象时返回原数据 */
export function pickByResponseField(data: unknown, responseField?: string): unknown {
  if (!responseField || !data || typeof data !== 'object') return data;
  return getObjectValueByPath(data as Record<string, unknown>, responseField, data);
}
