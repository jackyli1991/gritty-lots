import { isDataColumn } from '@neural/data/table';
import type { TableColumn } from '@neural/types/table';

/**
 * PrimeVue DataTable Column 组件可接收的核心 props。
 * 所有字段均为可选：按列类型选择性填充。
 */
export interface PrimeColumnProps {
  /** 绑定的数据字段（数据列使用） */
  field?: string;
  /** 表头文字 */
  header?: string;
  /** 是否可排序 */
  sortable?: boolean;
  /**
   * 表头单元格内联样式。
   * width / align 同时应用到 headerStyle 与 bodyStyle，保证表头与表体视觉对齐。
   */
  headerStyle?: Record<string, string>;
  /** 表体单元格内联样式。 */
  bodyStyle?: Record<string, string>;
  /** 单选 / 多选列专用 */
  selectionMode?: 'single' | 'multiple';
  /** 固定列（左/右），PrimeVue 5 Column 支持 */
  frozen?: boolean | 'left' | 'right';
}

/**
 * 从 TableColumn 配置生成 PrimeVue Column 的 props。
 * 统一处理字段映射、样式合并（width + align 同时应用到 headerStyle / bodyStyle），
 * 让渲染层只需要 `<Column v-bind="resolveColumnProps(col)" />`。
 */
export function resolveColumnProps(col: TableColumn): PrimeColumnProps {
  const props: PrimeColumnProps = {};

  // 内建列各自的专用 props
  if (col.type === 'selection') {
    props.selectionMode = 'single';
  } else if (col.type === 'multiSelection') {
    props.selectionMode = 'multiple';
  } else if (col.type === 'index') {
    props.header = col.title || '序号';
  }

  // 数据列通用 props
  if (isDataColumn(col.type)) {
    props.field = col.field;
    props.header = col.title || undefined;
    props.sortable = col.sortable;
  }

  // width + align 同时应用到表头和表体，避免仅 bodyStyle 或仅 headerStyle 造成对齐错位
  const style: Record<string, string> = {};
  if (col.width) style.width = `${col.width}px`;
  if (col.align) style.textAlign = col.align;
  if (Object.keys(style).length) {
    props.headerStyle = { ...style };
    props.bodyStyle = { ...style };
  }

  // 固定列
  if (col.fixed) {
    props.frozen = col.fixed;
  }

  console.log(props);

  return props;
}

/**
 * 从列配置数组推导 DataTable 的 selectionMode prop。
 * 互斥规则由元数据层保证（selection / multiSelection 不可共存），
 * 此处仅按优先级取第一个命中的类型。
 */
export function resolveSelectionMode(columns: readonly TableColumn[]): '' | 'single' | 'multiple' {
  if (columns.some((c) => c.type === 'selection')) return 'single';
  if (columns.some((c) => c.type === 'multiSelection')) return 'multiple';
  return '';
}
