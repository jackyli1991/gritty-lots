// 限定为 register.ts 中实际导出的组件名，避免用任意 string 索引 components
export type FormComponentName = keyof typeof import('./register');

export interface FormItemProps {
  label: string; // 表单项的标签
  fieldName: string; // 表单项的字段名
  component: FormComponentName; // 表单项的组件类型
  class?: string; // 表单项的类名（可选）
  componentProps: Record<string, any>; // 表单项的组件属性
  defaultValue: any; // 表单项的默认值
  help?: string[]; // 表单项的帮助信息（可选）
  required: boolean; // 是否必填项
}
