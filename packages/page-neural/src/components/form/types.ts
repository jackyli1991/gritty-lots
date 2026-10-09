// 限定为 register.ts 中实际导出的组件名，避免用任意 string 索引 components
export type FormComponentName = keyof typeof import('./register');

export interface FormItemProps {
  label: string; // 表单项的标签
  showLabel?: boolean; // 是否显示标签
  fieldName?: string; // 表单项的字段名
  modelValues?: Record<string, string>; // 额外的双向绑定值（可选），当一个组件同时绑定多个值时使用此字段提供fieldName之外的其他值名
  component?: FormComponentName; // 表单项的组件类型
  class?: string; // 表单项的类名（可选）
  componentProps?: Record<string, any>; // 表单项的组件属性
  help?: string[]; // 表单项的帮助信息（可选）
  required?: boolean; // 是否必填项
  tips?: string; // 表单项的提示信息（可选）
  children?: FormItemProps[]; // 子表单项（可选）
  formGroup?: boolean; // 是否为分组表单项
}
