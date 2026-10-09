import type { FormItemProps } from '@neural/components/form';
import { unitOptions, borderStyleOptions } from '@neural/data/options';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    label: '边框',
    formGroup: true,
    component: 'Fieldset',
    children: [
      {
        label: '宽度',
        fieldName: 'borderWidth',
        component: 'InputNumber',
        class: 'col-span-2',
        componentProps: {
          placeholder: '请输入宽度',
          showButtons: true,
          suffix: 'px',
          min: 0,
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
          options: borderStyleOptions,
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
          min: 0,
          fluid: true,
        },
        help: [],
        required: true,
      },
    ],
  },
  {
    label: '背景',
    formGroup: true,
    component: 'Fieldset',
    children: [
      {
        label: '背景色',
        fieldName: 'backgroundColor',
        component: 'ColorPicker',
        class: 'col-span-1',
        componentProps: {},
        help: [],
        required: true,
      },
    ],
  },
  {
    label: '尺寸',
    formGroup: true,
    component: 'Fieldset',
    children: [
      {
        label: '宽度',
        fieldName: 'width',
        component: 'InputNumberSelectGroup',
        class: 'col-span-2',
        modelValues: {
          selectValue: 'widthUnit',
        },
        componentProps: {
          placeholder: '请输入宽度',
          showButtons: true,
          min: 0,
          fluid: true,
          selectOptions: unitOptions,
        },
        help: [],
        required: true,
      },
      {
        label: '高度',
        fieldName: 'height',
        modelValues: {
          selectValue: 'heightUnit',
        },
        component: 'InputNumberSelectGroup',
        class: 'col-span-2',
        componentProps: {
          placeholder: '请输入高度',
          showButtons: true,
          min: 0,
          fluid: true,
          selectOptions: unitOptions,
        },
        help: [],
        required: true,
      },
    ],
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
