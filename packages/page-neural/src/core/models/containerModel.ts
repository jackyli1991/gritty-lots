import type { FormItemProps } from '@neural/components/form';
import ContainerAttrs from '@neural/core/attrs/container/index.vue';

function getForm(options: Record<string, any>): FormItemProps {
  return {
    label: '自定义参数',
    formGroup: true,
    component: 'Fieldset',
    icon: 'Box',
    children: [
      {
        label: '',
        fieldName: 'containerModel',
        component: 'Select',
        renderComponent: ContainerAttrs as any,
        class: 'col-span-full',
        componentProps: {},
        help: [],
        tips: '容器自定义属性。',
        ...options,
      },
    ],
  } as FormItemProps;
}

const model = {};

export default {
  getForm,
  model,
};
