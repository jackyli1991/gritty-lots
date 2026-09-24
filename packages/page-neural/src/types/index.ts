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
