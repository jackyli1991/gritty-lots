import type { FormItemProps } from '@neural/components/form';
import requestFormConfig from '@neural/core/forms/request';

function getForm(options: Record<string, any>): FormItemProps {
  return {
    label: '请求',
    formGroup: true,
    component: 'Fieldset',
    icon: 'Database',
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
        ...options,
      },
    ],
  } as FormItemProps;
}

const model = {
  url: '/test/api',
  method: 'GET',
  headers: {
    keyword: 'params',
  },
  params: {},
  enable: true,
  responseField: 'result.list',
};

export default {
  getForm,
  model,
};
