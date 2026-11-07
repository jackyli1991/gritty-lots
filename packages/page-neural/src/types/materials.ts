// 素材叶子项（可拖拽的最小单元）
export interface MaterialItem {
  name: string;
  type: string;
  icon: string;
  description?: string;
  component?: unknown;
}

// 素材小类（一个分组，包含若干叶子项）
export interface MaterialGroup {
  name: string;
  type: string;
  icon?: string;
  description?: string;
  children?: MaterialItem[];
}

// 素材模块（materials 下每个子目录的 index.ts 默认导出）
export interface MaterialModule {
  type: string;
  name: string;
  icon?: string;
  description?: string;
  category?: 'base' | 'custom'; // 大类归属，未声明时归为“基础”
  list: MaterialGroup[];
}
