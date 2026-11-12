/** 表格列类型：决定该列在 DataTable 中的渲染方式 */
export type TableColumnType =
  | 'selection' // 单选列
  | 'multiSelection' // 多选列
  | 'index' // 序号列
  | 'text' // 文本
  | 'tag' // 标签
  | 'image' // 图片
  | 'link' // 链接
  | 'button'; // 操作列

/** 水平对齐 */
export type TableColumnAlign = 'left' | 'center' | 'right';

/** 固定列位置 */
export type TableColumnFixed = 'left' | 'right' | null;

export interface TableColumn {
  /** 行唯一 id，排序 / diff 用 */
  id: string;
  /** 列类型 */
  type: TableColumnType;
  /** 列标题（selection/multiSelection/index 可不填） */
  title: string;
  /** 绑定字段；非数据列（selection/multiSelection/index/button）留空 */
  field: string;
  /** 列宽（像素），0 / null 表示自适应 */
  width: number | null;
  /** 水平对齐 */
  align: TableColumnAlign;
  /** 固定列位置 */
  fixed: TableColumnFixed;
  /** 是否可排序（仅数据类型列有效） */
  sortable: boolean;
}

export interface TableModelValue {
  size: string;
  showGridlines?: boolean;
  stripedRows?: boolean;
  emptyText?: string;
  columns: TableColumn[];
}
