import type { FormItemProps } from '@neural/components/form';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    label: '',
    fieldName: '',
    component: 'Divider',
    class: 'col-span-4',
    componentProps: {
      text: '边框',
    },
  },
  {
    label: '宽度',
    fieldName: 'borderWidth',
    component: 'InputNumber',
    class: 'col-span-2',
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
    label: '样式',
    fieldName: 'borderStyle',
    component: 'Select',
    class: 'col-span-2',
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
    label: '颜色',
    fieldName: 'borderColor',
    component: 'ColorPicker',
    class: 'col-span-2',
    componentProps: {},
    help: [],
    required: true,
  },
  {
    label: '圆角',
    fieldName: 'borderRadius',
    component: 'InputNumber',
    class: 'col-span-2',
    componentProps: {
      placeholder: '请输入边框圆角',
      showButtons: true,
      suffix: 'px',
      fluid: true,
    },
    help: [],
    required: true,
  },
  {
    label: '',
    fieldName: '',
    component: 'Divider',
    class: 'col-span-4',
    componentProps: {
      text: '背景',
    },
  },
  {
    label: '背景色',
    fieldName: 'backgroundColor',
    component: 'ColorPicker',
    class: 'col-span-1',
    componentProps: {},
    help: [],
    required: true,
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
    columns: 4,
    // autoComplete: false,
  },
  // 弹窗配置
  modalConfig: {
    header: '容器配置',
    component: 'drawer',
  },
};
