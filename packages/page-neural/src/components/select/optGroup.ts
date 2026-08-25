import { Select } from 'ant-design-vue';

/**
 * 直接导出 ant-design-vue 的 Select.OptGroup。
 * OptGroup 是带 isSelectOptGroup 标记的“数据组件”（渲染为 null），
 * 不能用 SFC 再包一层，否则 Select 无法识别分组，下拉分组会显示异常。
 */
const NeuralSelectOptGroup = Select.OptGroup;

export default NeuralSelectOptGroup;
