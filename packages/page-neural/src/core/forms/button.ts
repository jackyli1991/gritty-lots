import type { FormItemProps } from '@neural/components/form';
import { SEVERITY_OPTIONS } from '@neural/data/options';
import type { ActionButton } from '@neural/types/table';
import { generateId } from '@neural/utils';
import Button from 'primevue/button';
import { h } from 'vue';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    label: '文本',
    fieldName: 'content',
    component: 'InputText',
    class: 'col-span-2',
    componentProps: {
      placeholder: '按钮文本',
    },
    required: true,
  },

  {
    label: '类型',
    fieldName: 'severity',
    component: 'TagTypes',
    class: 'col-span-2',
    componentProps: {
      options: SEVERITY_OPTIONS,
    },
  },
  {
    label: '圆形',
    fieldName: 'rounded',
    component: 'ToggleSwitch',
    class: 'col-span-1',
    componentProps: {},
  },
  {
    label: '阴影',
    fieldName: 'raised',
    component: 'ToggleSwitch',
    class: 'col-span-1',
    componentProps: {},
  },
  {
    label: '样式',
    fieldName: 'variant',
    component: 'SelectButton',
    class: 'col-span-2',
    componentProps: {
      class: 'whitespace-nowrap',
      options: [
        { label: '纯文本', value: 'text' },
        { label: '带边框', value: 'outlined' },
        { label: '填充', value: '' },
      ],
    },
  },
  {
    label: '图标',
    fieldName: 'icon',
    component: 'InputText',
    class: 'col-span-2',
    componentProps: {
      placeholder: '图标名称',
    },
    tips: () => {
      return h('span', {}, [
        '输入',
        h(
          Button,
          {
            security: 'primary',
            variant: 'text',
            size: 'small',
            onClick: () => window.open('https://lucide.dev/icons', '_blank'),
          },
          { default: () => 'Lucide 图标' }
        ),
      ]);
    },
  },
];

const rules = z.object({
  content: z.string('请输入按钮文本').min(1),
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
    header: '按钮配置',
    component: 'dialog',
    class: 'w-[50vw]',
    dismissableMask: false, // 点击外部区域关闭弹窗
  },
};

/**
 * 创建按钮模型
 */
export function createButton(): ActionButton {
  return {
    id: generateId('button-'),
    content: '',
    severity: 'secondary',
    variant: 'text',
    rounded: false,
    raised: false,
    icon: '',
  };
}
