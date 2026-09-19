export interface ToolbarDropdownItem {
  /** 菜单项名称 */
  label: string;
  /** 图标名称（对应 register.ts 中注册的图标） */
  icon?: string;
  /** 操作唯一标识，点击时随 click 事件抛出 */
  key: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
}

export interface ToolbarItem {
  /** 按钮名称 */
  label: string;
  /** 图标名称（对应 register.ts 中注册的图标） */
  icon: string;
  /** 操作唯一标识，点击时随 click 事件抛出 */
  key: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 下拉菜单项，配置后该按钮渲染为 PrimeVue SplitButton */
  dropdownList?: ToolbarDropdownItem[];
}

import NeuralToolbar from './Toolbar.vue';

export default NeuralToolbar;
