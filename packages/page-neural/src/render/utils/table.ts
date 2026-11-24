import { isDataColumn } from '@neural/data/table';
import type { TableColumn, TableModelValue } from '@neural/types/table';

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
  /** 表头单元格内联样式。 */
  pt?: Record<string, any>;
  /**
   * 表头单元格内联样式。
   * width / align 同时应用到 headerStyle 与 bodyStyle，保证表头与表体视觉对齐。
   */
  headerStyle?: Record<string, string>;
  /** 表体单元格内联样式。 */
  style?: Record<string, string>;
  /** 单选 / 多选列专用 */
  selectionMode?: 'single' | 'multiple';
  /** 固定列（左/右），PrimeVue 5 Column 支持 */
  frozen?: boolean;
  /** 固定列对齐方式 */
  alignFrozen?: 'left' | 'right';
}

const alignMaps = {
  left: 'flex-start',
  right: 'flex-end',
  center: 'center',
};

/**
 * 从 TableColumn 配置生成 PrimeVue Column 的 props。
 * 统一处理字段映射、样式合并（width + align 同时应用到 headerStyle / bodyStyle），
 * 让渲染层只需要 `<Column v-bind="resolveColumnProps(col)" />`。
 */
export function resolveColumnProps(col: TableColumn): PrimeColumnProps {
  const props: PrimeColumnProps = {};

  // 通用 props
  props.field = col.field;
  props.header = col.title || undefined;

  // 单选列、多选列专用 props
  if (col.type === 'selection') {
    props.selectionMode = 'single';
    props.header = '';
  } else if (col.type === 'multiSelection') {
    props.selectionMode = 'multiple';
    props.header = '';
  }

  // type === 'index' 时，默认添加序号标题
  if (col.type === 'index') {
    props.header = col.title || '序号';
  }

  // 数据列启用排序
  if (isDataColumn(col.type)) {
    props.sortable = col.sortable;
  }

  // fixed: 列固定
  if (col.fixed) {
    props.frozen = !!col.fixed;
    props.alignFrozen = col.fixed;
  }

  // width + align 同时应用到表头和表体
  const style: Record<string, string> = {
    paddingLeft: '8px',
    paddingRight: '8px',
  };
  const headerStyle: Record<string, string> = {};
  const commonStyle: Record<string, string> = {};
  if (col.width) style.minWidth = `${col.width}px`;
  if (col.width) style.maxWidth = `${col.width}px`;
  if (col.align) {
    headerStyle.display = 'flex';
    headerStyle.justifyContent = alignMaps[col.align];

    style.textAlign = col.align;
  }
  props.pt = {
    columnheadercontent: {
      style: { ...commonStyle, ...headerStyle },
    },
  };
  props.style = { ...commonStyle, ...style };

  return props;
}

/**
 * 从表格容器模型解析出可直接绑定到 PrimeVue DataTable 的 props。
 * 只透传 DataTable 认识的字段，排除：
 * - columns：由模板用 resolveColumnProps 单独渲染
 * - emptyText：由 #empty 插槽单独消费
 * 后续新增配置（如分页）在此处转换为 DataTable 所需的 prop，而不是靠 v-bind 原样透传。
 */
export function resolveTableProps(model: TableModelValue) {
  return {
    size: model.size,
    showGridlines: model.showGridlines,
    stripedRows: model.stripedRows,
  };
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
