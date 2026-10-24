import { generateId } from '@neural/core/crud/utils';
import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';

/** 面板尺寸单位，取自节点类型定义 */
export type PanelUnit = NonNullable<LayoutPanelNode['useUnit']>;

/** 新增面板的默认尺寸单位 */
export const DEFAULT_PANEL_UNIT: PanelUnit = '%';

/** 单位点击切换顺序 */
export const UNIT_CYCLE: readonly PanelUnit[] = ['px', '%']; //  'vw', 'vh'

/**
 * 计算面板的 inline flex 样式（画布渲染与缩略图共用）：
 * - useUnit !== '%' → flex: 0 0 {sizeValue}{unit}（固定不伸缩）
 * - useUnit === '%' → flex: {sizeValue} 1 0px（按 sizeValue 权重伸缩，basis=0px）
 * @param panel 面板节点
 */
export function panelFlexStyle(panel: LayoutPanelNode): Record<string, string> {
  const unit = panel.useUnit ?? DEFAULT_PANEL_UNIT;
  const size = panel.sizeValue ?? 50;

  if (unit === '%') {
    return { flex: `${size} 1 0px` };
  }

  return { flex: `0 0 ${size}${unit}` };
}

/**
 * 计算面板在缩略图中的 flex 样式：始终按 panel.percentage 等比分配，
 * 与画布中实际单位（px / %）无关，保证缩略图比例稳定
 * @param panel 面板节点
 */
export function percentFlexStyle(panel: LayoutPanelNode): Record<string, string> {
  return { flex: `${panel.percentage} 1 0px` };
}

/**
 * 生成布局面板节点
 * @param overrides 需要覆盖的字段（如 children）
 * @returns 面板节点，默认单位为 %、尺寸值与百分比均为 50、无子内容
 */
export function generatePanelNode(overrides?: Partial<LayoutPanelNode>): LayoutPanelNode {
  return {
    id: generateId(),
    type: 'splitterPanel',
    useUnit: DEFAULT_PANEL_UNIT,
    sizeValue: 50,
    percentage: 50,
    containerId: '',
    children: [],
    ...overrides,
  };
}

/**
 * 生成布局分隔器节点
 * @param layout 布局方向
 * @param children 子面板列表，缺省时按默认占比生成 2 个空面板
 * @returns 分隔器节点
 */
export function generateSplitterNode({
  layout,
  children,
}: {
  layout: LayoutSplitterNode['layout'];
  children?: LayoutPanelNode[];
}): LayoutSplitterNode {
  const panels = children ?? [generatePanelNode(), generatePanelNode()];
  return {
    id: generateId(),
    type: 'splitter',
    layout,
    children: panels,
  };
}

/**
 * 从面板取出唯一的嵌套分隔器（若存在）
 * @param panel 面板节点
 * @returns 嵌套分隔器，或 undefined
 */
export function getPanelSplitter(panel: LayoutPanelNode): LayoutSplitterNode | undefined {
  return panel.children[0];
}

/**
 * 取单位循环中的下一个单位
 * @param unit 当前单位
 */
export function nextUnit(unit: PanelUnit): PanelUnit {
  const index = UNIT_CYCLE.indexOf(unit);
  return UNIT_CYCLE[(index + 1) % UNIT_CYCLE.length];
}

/**
 * 把面板轴向像素换算为相对所属分隔器的百分比
 * @param axisPx 面板沿所属分隔器轴向的真实像素
 * @param containerPx 分隔器容器轴向像素
 */
export function toPercentage(axisPx: number, containerPx: number): number {
  return containerPx > 0 ? round2((axisPx / containerPx) * 100) : 0;
}

/** 保留 2 位小数 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 由 percentage 与实际像素推导 sizeValue：% 直接取占比值，px 取面板实际像素 */
export function applySizeValue(panel: LayoutPanelNode, panelPx: number) {
  panel.sizeValue = panel.useUnit === 'px' ? Math.round(panelPx) : panel.percentage;
}
