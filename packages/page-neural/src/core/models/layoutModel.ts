import type { FormItemProps } from '@neural/components/form';

function getForm(options: Record<string, any>): FormItemProps {
  return {
    label: '布局',
    formGroup: true,
    component: 'Fieldset',
    icon: 'Layout',
    children: [
      {
        label: '',
        fieldName: 'layoutModel',
        component: 'LayoutModel',
        class: 'col-span-full',
        componentProps: {},
        help: [],
        tips: '用于设置布局属性。',
        ...options,
      },
    ],
  } as FormItemProps;
}

const model = {
  type: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flexWrap: 'nowrap',
  gap: 0,
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: 'auto',
};

export default {
  getForm,
  model,
};
