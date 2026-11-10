import type { FormItemProps } from '@neural/components/form';

function getForm(options: Record<string, any>): FormItemProps {
  return {
    label: '盒模型',
    formGroup: true,
    component: 'Fieldset',
    icon: 'Box',
    children: [
      {
        label: '',
        fieldName: 'boxModel',
        component: 'BoxModel',
        class: 'col-span-full',
        componentProps: {},
        help: [],
        tips: '盒模型属性，包括外边距、内边距、边框、圆角、宽度、高度及单位。',
        ...options,
      },
    ],
  };
}

const model = {
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  border: { top: 0, right: 0, bottom: 0, left: 0, style: 'solid', color: '' },
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  width: 50,
  height: 50,
  borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
  units: { margin: 'px', border: 'px', padding: 'px', width: '%', height: '%' },
};

export default {
  getForm,
  model,
};
