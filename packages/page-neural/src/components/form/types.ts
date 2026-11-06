import type { FormInstance } from '@primevue/forms';
import type { VNode } from 'vue';

// 限定为 register.ts 中实际导出的组件名，避免用任意 string 索引 components
export type FormComponentName = keyof typeof import('./register');

/** 联动 resolve 回调参数 */
export interface FormDependencyContext {
  values: Record<string, any>; // 最新表单数据
  schema: FormItemProps; // 当前表单项配置
  formContextApi: FormInstance; // 表单实例
}

/** 表单项联动配置 */
export interface FormItemDependencies {
  trigger?: string[]; // 触发联动的字段，可多选；字段 onChange 时触发
  resolve: (context: FormDependencyContext) => Partial<FormItemProps> | void; // 返回当前表单项的配置更新
}

export interface FormItemProps {
  label: string; // 表单项的标签
  showLabel?: boolean; // 是否显示标签
  fieldName?: string; // 表单项的字段名
  modelValues?: Record<string, string>; // 额外的双向绑定值（可选），当一个组件同时绑定多个值时使用此字段提供fieldName之外的其他值名
  component?: FormComponentName; // 表单项的组件类型
  renderComponent?: VNode; // 自定义渲染的 VNode（h() 生成），优先级高于 component
  class?: string; // 表单项的类名（可选）
  componentProps?: Record<string, any>; // 表单项的组件属性
  help?: string[]; // 表单项的帮助信息（可选）
  required?: boolean; // 是否必填项
  tips?: string | VNode | (() => VNode); // 表单项的提示信息，支持字符串、VNode 或渲染函数
  children?: FormItemProps[]; // 子表单项（可选）
  formGroup?: boolean; // 是否为分组表单项
  disabled?: boolean; // 是否禁用
  hidden?: boolean; // 是否隐藏（不渲染，提交数据不含该字段，并跳过校验）
  visible?: boolean; // 是否可见（false 时仅视觉隐藏，保留值与校验）
  dependencies?: FormItemDependencies; // 联动配置（可选）
}
