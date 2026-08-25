import { Select } from 'ant-design-vue';

/**
 * 直接导出 ant-design-vue 的 Select.Option。
 * Option 是带 isSelectOption 标记的“数据组件”（渲染为 null），
 * 不能用 SFC 再包一层，否则 Select 无法从子节点识别选项。
 */
const NeuralSelectOption = Select.Option;

export default NeuralSelectOption;
