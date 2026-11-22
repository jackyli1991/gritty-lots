import type { DataModelOptions, DataModelMode } from '@neural/core/models/dataModel';
import { getObjectValueByPath } from '@neural/utils';

/** 解析数据模型的获取方式 */
export function resolveDataModelMode(dataModel?: DataModelOptions | null): DataModelMode | '' {
  if (!dataModel) return '';
  if (dataModel.mode) return dataModel.mode;
  if (dataModel.sourceId) return 'source';
  if (dataModel.customJson) return 'custom';
  if (dataModel.referenceId) return 'reference';
  return '';
}

/** 按 responseField 从数据中提取指定字段；未配置或数据非对象时返回原数据 */
export function pickByResponseField(data: unknown, responseField?: string): unknown {
  if (!responseField || !data || typeof data !== 'object') return data;
  return getObjectValueByPath(data as Record<string, unknown>, responseField, data);
}
