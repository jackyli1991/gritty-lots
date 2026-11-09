import type { MaterialModule } from '@neural/types/materials';

export default {
  type: 'table',
  icon: 'Table',
  name: '表格',
  description: '表格，用于组织页面的表格。',
  list: [
    {
      name: '表格列',
      type: 'table-column',
      icon: 'Table',
      description: '表格列，用于组织页面的表格列。',
      children: [
        {
          name: '文本',
          type: 'text',
          icon: 'Text',
          component: null,
          description: '普通文字，用于组织普通文字。',
        },
        {
          name: '图片',
          type: 'image',
          icon: 'Image',
          component: null,
          description: '图片，用于组织图片。',
        },
        {
          name: '金额',
          type: 'money',
          icon: 'JapaneseYen',
          component: null,
          description: '金额，用于组织金额。',
        },
        {
          name: '日期',
          type: 'date',
          icon: 'CalendarDays',
          component: null,
          description: '日期，用于组织日期。',
        },
      ],
    },
    {
      name: '分页',
      type: 'pagination',
      icon: 'Pagination',
      description: '分页，用于组织页面的分页。',
      children: [
        {
          name: '分页',
          type: 'pagination',
          icon: 'Pagination',
          component: null,
          description: '分页，用于组织页面的分页。',
        },
      ],
    },
    {
      name: '总数',
      type: 'table',
      icon: 'Table',
      description: '总数，用于组织页面的总数。',
      children: [
        {
          name: '总数',
          type: 'text',
          icon: 'Text',
          component: null,
          description: '总数，用于组织总数。',
        },
      ],
    },
  ],
} satisfies MaterialModule;
