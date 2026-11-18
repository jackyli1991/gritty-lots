import type { FormItemProps } from '@neural/components/form';
import { registerColumnFormSchema } from '@neural/core/forms/table-column';
import { addColumnMeta, hasColumnType } from '@neural/data/table';
import type { TableColumnMeta } from '@neural/data/table';

/**
 * 注册自定义表格列
 * @param column 表格列元数据；配置了 component 时，该组件会收到 { row, column } 两个 props
 * @param formSchema 追加到列属性面板的表单项，其值会平铺写入列对象
 * @returns 是否注册成功（类型重复时返回 false）
 */
export function registerTableColumn(
  column: TableColumnMeta,
  formSchema: FormItemProps[] = []
): boolean {
  if (hasColumnType(column.type)) {
    console.warn(`[page-neural] 检测到重复注册表格列：${column.type}，已跳过`);
    return false;
  }

  addColumnMeta(column);
  registerColumnFormSchema(column.type, formSchema);
  return true;
}
