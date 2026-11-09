import type { MaterialModule } from '@neural/types/materials';

export default {
  type: 'font',
  icon: 'ALargeSmall',
  name: '文本',
  description: '文本，用于组织页面的文本。',
  list: [
    {
      name: '艺术字',
      type: 'artistic-font',
      icon: 'Font',
      description: '艺术字，用于组织页面的艺术字字体。',
      children: [],
    },
    {
      name: '普通字',
      type: 'normal-font',
      icon: 'Font',
      description: '普通字，用于组织页面的普通字字体。',
      children: [],
    },
  ],
} satisfies MaterialModule;
