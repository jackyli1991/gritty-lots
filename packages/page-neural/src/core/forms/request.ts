import type { FormItemProps } from '@neural/components/form';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    label: '请求地址',
    fieldName: 'url',
    component: 'Input',
    class: 'col-span-2',
    componentProps: {
      placeholder: '请输入请求地址',
      prefix: '/api',
      // suffix: 'xxx',
    },
    help: [],
    required: true,
    tips: '须以/开头，示例：/request/api',
  },
  {
    label: '请求方法',
    fieldName: 'method',
    component: 'Select',
    class: 'col-span-1',
    componentProps: {
      placeholder: '请选择',
      optionLabel: 'label',
      optionValue: 'value',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
      ],
    },
    help: [],
    required: true,
  },
  {
    label: '响应字段',
    fieldName: 'responseField',
    component: 'InputText',
    class: 'col-span-1',
    componentProps: {
      placeholder: '取response中的数据，示例：data.list',
      showClear: true,
    },
    help: [],
    // required: true,
  },
  {
    label: '请求头',
    fieldName: 'headers',
    component: 'ObjectEditor',
    class: 'col-span-2',
    componentProps: {
      placeholder: '请求头',
    },
    help: [],
    required: false,
  },
  {
    label: '请求参数',
    fieldName: 'params',
    component: 'ObjectEditor',
    class: 'col-span-2',
    componentProps: {
      placeholder: '请求参数',
    },
    help: [],
    required: false,
  },
];

const rules = z.object({
  url: z.string().min(1, '请输入请求地址'),
  method: z.string().min(1, '请输入请求方法'),
});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 2,
  },
  // 弹窗配置
  modalConfig: {
    header: '请求配置',
    component: 'drawer',
  },
};
