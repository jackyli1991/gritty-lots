import type { FormItemProps } from '@neural/components/form';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    label: '宽度',
    fieldName: 'borderWidth',
    component: 'InputNumber',
    class: 'col-span-1',
    componentProps: {
      placeholder: '请输入宽度',
      showButtons: true,
      suffix: 'px',
      fluid: true,
    },
    help: [],
    required: true,
  },
  {
    label: '边框样式',
    fieldName: 'borderStyle',
    component: 'Select',
    class: 'col-span-1',
    componentProps: {
      placeholder: '请选择',
      optionLabel: 'label',
      optionValue: 'value',
      options: [
        { label: 'solid', value: 'solid' },
        { label: 'dashed', value: 'dashed' },
        { label: 'dotted', value: 'dotted' },
        { label: 'double', value: 'double' },
      ],
    },
    help: [],
    required: true,
  },
  {
    label: '边框颜色',
    fieldName: 'borderColor',
    component: 'InputText',
    class: 'col-span-1',
    componentProps: {
      placeholder: '请输入边框颜色',
      showClear: true,
    },
    help: [],
    required: true,
  },
  {
    label: '',
    fieldName: 'divider',
    component: 'Divider',
    class: 'col-span-3',
  },
];

const rules = z.object({
  name: z.string().min(1, '请输入容器名称'),
});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 3,
    // autoComplete: false,
  },
  // 弹窗配置
  modalConfig: {
    header: '容器配置',
    component: 'drawer',
  },
};
