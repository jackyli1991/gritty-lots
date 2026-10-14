import type { FormItemProps } from '@neural/components/form';
// import { unitOptions } from '@neural/data/options';
import { z } from 'zod';

import requestFormConfig from './request';

const schema: FormItemProps[] = [
  {
    label: '盒模型',
    formGroup: true,
    component: 'Fieldset',
    children: [
      {
        label: '',
        fieldName: 'boxModel',
        component: 'BoxModel',
        class: 'col-span-full',
        componentProps: {},
        help: [],
        tips: '用于设置盒模型属性，包括外边距、内边距、边框、圆角、宽度、高度及单位。',
      },
    ],
  },
  {
    label: '布局',
    formGroup: true,
    component: 'Fieldset',
    children: [
      {
        label: '',
        fieldName: 'layoutModel',
        component: 'LayoutModel',
        class: 'col-span-full',
        componentProps: {},
        help: [],
        tips: '用于设置布局属性。',
      },
    ],
  },
  {
    label: '背景',
    formGroup: true,
    component: 'Fieldset',
    children: [
      {
        label: '',
        // showLabel: false,
        fieldName: 'backgroundModel',
        component: 'BackgroundModel',
        class: 'col-span-full',
        componentProps: {},
        help: [],
        // required: true,
        tips: '用于设置背景效果，包括颜色、图片、重复、位置、大小、剪裁等。',
      },
    ],
  },
  {
    label: '请求',
    formGroup: true,
    component: 'Fieldset',
    children: [
      {
        label: '',
        fieldName: 'requestModel',
        component: 'NeuralForm',
        class: 'col-span-full',
        componentProps: {
          ...requestFormConfig.formConfig,
        },
        help: [],
        tips: '用于设置请求属性，包括方法、URL、参数、头信息等。',
      },
    ],
  },
  // {
  //   label: '尺寸',
  //   formGroup: true,
  //   component: 'Fieldset',
  //   children: [
  //     {
  //       label: '宽度',
  //       fieldName: 'width',
  //       component: 'InputNumberSelectGroup',
  //       class: 'col-span-2',
  //       modelValues: {
  //         selectValue: 'widthUnit',
  //       },
  //       componentProps: {
  //         placeholder: '请输入宽度',
  //         showButtons: true,
  //         min: 0,
  //         fluid: true,
  //         selectOptions: unitOptions,
  //       },
  //       help: [],
  //       required: true,
  //     },
  //     {
  //       label: '高度',
  //       fieldName: 'height',
  //       modelValues: {
  //         selectValue: 'heightUnit',
  //       },
  //       component: 'InputNumberSelectGroup',
  //       class: 'col-span-2',
  //       componentProps: {
  //         placeholder: '请输入高度',
  //         showButtons: true,
  //         min: 0,
  //         fluid: true,
  //         selectOptions: unitOptions,
  //       },
  //       help: [],
  //       required: true,
  //     },
  //   ],
  // },
];

const rules = z.object({});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 1,
    // autoComplete: false,
  },
  // 弹窗配置
  modalConfig: {
    header: '容器配置',
    component: 'drawer',
    class: 'w-[450px]!',
  },
};
