import {
  resolveFieldOriginData,
  resolveField,
  resolveFieldPrefix,
  resolveFieldSuffix,
} from '@neural/render/utils/table';
import type { TableColumn } from '@neural/types/table';

/**
 * 从数据行解析出列绑定字段的原始值
 * @param row 当前行数据
 * @param column 列配置
 * @returns
 *  field: 列绑定字段
 *  fieldData: 列绑定字段的原始值
 *  prefix: 列前缀
 *  suffix: 列后缀
 */
export function useColumnData(
  row: Record<string, any>,
  column: TableColumn
): {
  field: string | undefined;
  fieldData: any;
  prefix: string;
  suffix: string;
} {
  return {
    field: resolveField(column.field),
    fieldData: resolveFieldOriginData(row, column.field),
    prefix: resolveFieldPrefix(column.field),
    suffix: resolveFieldSuffix(column.field),
  };
}
