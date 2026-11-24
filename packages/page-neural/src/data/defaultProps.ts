// 表单内置组件的默认属性配置：以组件注册名（component）为 key
// 优先级最低，会被 schema 中显式传入的 componentProps 覆盖
export const defaultProps: Record<string, Record<string, any>> = {
  InputNumber: {
    fluid: true,
    showButtons: true,
  },
  Select: {
    size: 'small',
    placeholder: '请选择',
    optionLabel: 'label',
    optionValue: 'value',
  },
  SelectButton: {
    size: 'small',
    optionLabel: 'label',
    optionValue: 'value',
  },
  Listbox: {
    size: 'small',
    optionLabel: 'label',
    optionValue: 'value',
  },
};
