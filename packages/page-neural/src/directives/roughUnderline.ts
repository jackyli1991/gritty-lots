import { annotate } from 'rough-notation';
import type { ObjectDirective } from 'vue';

/** 元素与手绘标注实例的映射，避免重复创建 */
const annotations = new WeakMap();

/** 读取主题主色，作为手绘描边颜色 */
function getPrimaryColor(el: HTMLElement): string {
  const color = getComputedStyle(el).getPropertyValue('--p-primary-color').trim();
  return color || '#863bff';
}

/**
 * 手绘下划线指令：绑定值为 true 时绘制，false 时隐藏
 * 用法：v-rough-underline="isActive"
 */
export const vRoughUnderline: ObjectDirective<HTMLElement, boolean> = {
  mounted(el, binding) {
    const annotation = annotate(el, {
      type: 'underline',
      color: getPrimaryColor(el),
      strokeWidth: 2,
      padding: 2,
      animationDuration: 300,
    });
    annotations.set(el, annotation);
    if (binding.value) annotation.show();
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return;
    const annotation = annotations.get(el);
    if (!annotation) return;
    // 主题切换后重新读取主色，保证描边颜色跟随
    annotation.color = getPrimaryColor(el);
    if (binding.value) annotation.show();
    else annotation.hide();
  },
  unmounted(el) {
    annotations.get(el)?.remove();
    annotations.delete(el);
  },
};
