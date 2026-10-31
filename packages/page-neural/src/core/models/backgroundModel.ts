import type { FormItemProps } from '@neural/components/form';

export function getForm(options: Record<string, any>): FormItemProps {
  return {
    label: '背景',
    formGroup: true,
    component: 'Fieldset',
    icon: 'Images',
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
        ...options,
      },
    ],
  } as FormItemProps;
}

const model = {
  backgroundColor: '#fff',
  backgroundImage: '',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: 'contain',
  backgroundOrigin: 'padding-box',
  backgroundClip: 'border-box',
  scale: [1, 1],
};

export default {
  getForm,
  model,
};
