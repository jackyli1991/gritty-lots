import { Icon } from '@iconify/vue';
import { defineComponent, h } from 'vue';

/**
 * 创建图标组件
 * @param icon 图标名称
 * @returns 图标组件
 */
function createIcon(icon: string) {
  return defineComponent({
    name: `Iconify-${icon}`,
    setup(props, { attrs }) {
      return () => h(Icon, { icon, ...props, ...attrs }); // 渲染图标组件
    },
  });
}

export { createIcon };
