import type { FormItemProps } from '@neural/components/form';
import { z } from 'zod';

const dependencies = {
  trigger: ['type'],
  resolve: ({ values }: { values: Record<string, any> }) => ({
    hidden: values.type !== 'http',
  }),
};

const schema: FormItemProps[] = [
  {
    label: '名称',
    fieldName: 'name',
    component: 'Input',
    class: 'col-span-2',
    componentProps: {
      placeholder: '描述请求的功能',
    },
    help: [],
    required: true,
  },

  {
    label: '类型',
    fieldName: 'type',
    component: 'Select',
    class: 'col-span-2',
    componentProps: {
      placeholder: '请选择',
      optionLabel: 'label',
      optionValue: 'value',
      options: [
        { label: 'JSON数据', value: 'json' },
        { label: 'HTTP请求', value: 'http' },
      ],
    },
    help: [],
    required: true,
  },
  {
    label: '地址',
    fieldName: 'url',
    component: 'Input',
    class: 'col-span-3',
    componentProps: {
      placeholder: '请输入请求地址',
      prefix: '/api',
      // suffix: 'xxx',
    },
    help: [],
    required: true,
    tips: '必须以/开头，示例：/request/api',
    dependencies,
  },
  {
    label: '方法',
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
    dependencies,
  },
  {
    label: '响应字段',
    fieldName: 'responseField',
    component: 'InputText',
    class: 'col-span-4',
    componentProps: {
      placeholder: '取response中的数据，示例：data.list',
      showClear: true,
    },
    help: [],
    // required: true,
    dependencies,
  },
  {
    label: '请求头',
    fieldName: 'headers',
    component: 'ObjectEditor',
    class: 'col-span-4',
    componentProps: {
      placeholder: '请求头',
    },
    help: [],
    required: false,
    dependencies,
  },
  {
    label: '请求参数',
    fieldName: 'params',
    component: 'ObjectEditor',
    class: 'col-span-4',
    componentProps: {
      placeholder: '请求参数',
    },
    help: [],
    required: false,
    dependencies,
  },
  {
    label: 'JSON数据',
    fieldName: 'json',
    component: 'CodeMirror',
    class: 'col-span-full',
    componentProps: {
      placeholder: 'JSON数据',
    },
    help: [],
    required: false,
    dependencies: {
      trigger: ['type'],
      resolve: ({ values }: { values: Record<string, any> }) => ({
        hidden: values.type !== 'json',
      }),
    },
  },
];

const rules = z.object({
  name: z.string('请输入请求名称').min(1),
  type: z.string('请选择请求类型').min(1),
  url: z.string('请输入请求地址').min(1),
  method: z.string('请选择请求方法').min(1),
});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 4,
    autoComplete: false,
  },
  // 弹窗配置
  modalConfig: {
    header: '数据源配置',
    component: 'dialog',
    class: 'w-[50vw]',
    dismissableMask: false, // 点击外部区域关闭弹窗
  },
};

/**
 * 创建请求表单模型
 */
export function createRequest() {
  return {
    name: '',
    type: 'http',
    url: '',
    method: 'GET',
    responseField: '',
    headers: {},
    params: {},
    json: '',
  };
}
