import type { FormItemProps } from '@neural/components/form';
import ContainerAttrs from '@neural/core/attrs/container/index.vue';

function getForm(options: Record<string, any>): FormItemProps {
  return {
    label: '自定义参数',
    formGroup: true,
    component: 'Fieldset',
    icon: 'PencilRuler',
    // 单独展示containerModel时的弹窗配置
    modalConfig: {
      class: 'w-[50vw]',
    },
    children: [
      {
        label: '',
        fieldName: 'containerModel',
        component: 'Select',
        renderComponent: ContainerAttrs,
        class: 'col-span-full',
        componentProps: {},
        help: [],
        tips: '容器自定义属性。',
        ...options,
      },
    ],
  };
}

const model = {};

export default {
  getForm,
  model,
};
