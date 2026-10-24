import type { DragEndEvent } from '@dnd-kit/vue';

export interface ModalOptions {
  header: string; // 标题
  position?: string; // 位置 'left' | 'right' | 'top' | 'bottom'
  showCloseIcon?: boolean; // 是否显示关闭图标
  class?: string; // 自定义类名
  component: string; // 组件类型 drawer-抽屉 dialog-弹窗组件
  [key: string]: any;
}

export interface FormOptions {
  columns: number; // 表单列数
  autoComplete?: boolean; // 是否开启自动完成
  schema: any; // 表单 schema
  rules: any; // 表单校验规则
}

export interface DragNodeOptions {
  type: string; // 节点类型
  source: DragEndEvent['operation']['source']; // 源节点
  target: DragEndEvent['operation']['target']; // 目标节点
}

export interface Container {
  id: string; // 容器 id
  name: string; // 容器名称
  type: string; // 容器类型
  subType: string; // 容器子类型
  parentId: string; // 父容器 id
  props: Record<string, any>; // 容器属性
  children: string[]; // 子容器 id 列表
}

// 布局面板节点
export interface LayoutPanelNode {
  id: string; // 面板节点 id
  type: 'splitterPanel'; // 节点类型
  percentage: number; // 百分比值，面板在所属分隔器中的占比
  sizeValue?: number; // 分隔器尺寸值（按 useUnit 解释）
  useUnit?: 'px' | '%'; // 分隔器尺寸单位 'vw' | 'vh'
  containerId: string; // 管理的容器 id
  children: LayoutSplitterNode[]; // 子内容：嵌套分隔器（最多一个，数组以便递归统一处理）
}

// 布局分隔器节点
export interface LayoutSplitterNode {
  id: string; // 分隔器节点 id
  type: 'splitter'; // 节点类型
  layout: 'horizontal' | 'vertical'; // 布局方向
  children: LayoutPanelNode[]; // 子面板列表
}

// 页面
export interface Page {
  id: string; // 页面 id
  name: string; // 页面名称
  description: string; // 页面描述
  layoutLock: boolean; // 是否锁定布局
  deletable: boolean; // 是否可删除
  layoutId: string; // 关联的根布局 id
}
