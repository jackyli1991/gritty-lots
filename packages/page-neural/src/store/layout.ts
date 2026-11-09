import {
  DEFAULT_PANEL_UNIT,
  generatePanelNode,
  nextUnit,
  applySizeValue,
} from '@neural/core/layout/utils';
import { usePageNeuralStore } from '@neural/store';
import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';
import { defineStore } from 'pinia';

// 布局编辑状态：面板/分隔器的增删操作、悬停高亮与选中编辑
export const useLayoutStore = defineStore('page-neural-layout', {
  state: () => ({
    // 画布当前悬停的面板 id（全局唯一，嵌套分隔器共享，避免父子分隔器各自维护导致状态残留）
    hoveredPanelId: null as string | null,
    // 图层树当前悬停的面板/分隔器 id（反向联动：树中悬停 → 画布高亮对应节点）
    treeHoveredPanelId: null as string | null,
    treeHoveredSplitterId: null as string | null,
    // 当前选中的节点（树、属性面板与画布共享，单选）
    selectedNode: null as { id: string; type: 'splitter' | 'splitterPanel' } | null,
  }),
  getters: {
    // 布局是否锁定：取当前激活页面的 layoutLock，作为所有编辑入口的统一开关
    locked(): boolean {
      return !!usePageNeuralStore().activePage?.layoutLock;
    },
  },
  actions: {
    // 设置画布当前悬停的面板 id
    setHoveredPanelId(id: string | null) {
      this.hoveredPanelId = id;
    },
    // 设置图层树当前悬停的面板 id
    setTreeHoveredPanelId(id: string | null) {
      this.treeHoveredPanelId = id;
    },
    // 设置图层树当前悬停的分隔器 id
    setTreeHoveredSplitterId(id: string | null) {
      this.treeHoveredSplitterId = id;
    },
    // 选中节点（单选）；再次点击同一节点保持选中
    selectNode(type: 'splitter' | 'splitterPanel', id: string) {
      this.selectedNode = { id, type };
    },
    // 清除选中态
    clearSelectedNode() {
      this.selectedNode = null;
    },
    // 一键平均分配：仅处理 % 单位面板，px 面板先扣除其占比，剩余百分比再均分
    distributePanelsEvenly(splitter: LayoutSplitterNode) {
      if (this.locked) return;

      const percentPanels = splitter.children.filter(
        (panel) => (panel.useUnit ?? DEFAULT_PANEL_UNIT) === '%'
      );
      if (!percentPanels.length) return;

      const fixedPercent = splitter.children
        .filter((panel) => (panel.useUnit ?? DEFAULT_PANEL_UNIT) !== '%')
        .reduce((sum, panel) => sum + (panel.percentage ?? 0), 0);
      const remainPercent = Math.max(0, 100 - fixedPercent);
      const each = Math.round((remainPercent / percentPanels.length) * 100) / 100;

      percentPanels.forEach((panel) => {
        panel.percentage = each;
        panel.sizeValue = each;
      });
    },
    // 设置面板背景色，传空值即清除
    setPanelBackground(panel: LayoutPanelNode, color?: string) {
      if (this.locked) return;
      panel.backgroundColor = color || '';
    },
    // 在分隔器指定位置新增同级面板
    addPanel(splitter: LayoutSplitterNode, index: number) {
      if (this.locked) return;
      splitter.children.splice(index, 0, generatePanelNode());
    },
    // 删除指定面板：不限制剩余数量；删空后该嵌套分隔器已成空壳，连同它一起清除
    deletePanel(
      splitter: LayoutSplitterNode,
      parentPanel: LayoutPanelNode | undefined,
      index: number
    ) {
      if (this.locked) return;

      const removed = splitter.children[index];
      if (removed && this.selectedNode?.id === removed.id) this.selectedNode = null;

      splitter.children.splice(index, 1);

      if (!splitter.children.length && parentPanel) {
        parentPanel.children = [];
        // 嵌套分隔器被一并清除时，选中它也失效
        if (this.selectedNode?.id === splitter.id) this.selectedNode = null;
      }
    },
    // 删除分隔器：清空其所在父面板内容（根分隔器不可删除，由调用方保证）
    deleteSplitter(parentPanel: LayoutPanelNode | undefined) {
      if (this.locked || !parentPanel) return;

      const removedSplitter = parentPanel.children[0];
      parentPanel.children = [];
      if (removedSplitter && this.selectedNode?.id === removedSplitter.id) {
        this.selectedNode = null;
      }
    },
    // 循环切换面板尺寸单位；切换前先按画布实际渲染像素重算 sizeValue，避免切换瞬间尺寸跳变
    toggleUnit(splitter: LayoutSplitterNode, panel: LayoutPanelNode) {
      if (this.locked) return;
      const panelEl = document.querySelector<HTMLElement>(`[data-panel-id="${panel.id}"]`);
      const rect = panelEl?.getBoundingClientRect();
      const panelPx = rect ? (splitter.layout === 'horizontal' ? rect.width : rect.height) : 0;

      panel.useUnit = nextUnit(panel.useUnit ?? DEFAULT_PANEL_UNIT);

      if (panelPx) {
        applySizeValue(panel, panelPx);
      }
    },
    // 更新分隔器间距（px），最小 0
    updateSplitterGap(splitter: LayoutSplitterNode, gap: number) {
      if (this.locked) return;
      splitter.gap = Math.max(0, Math.round(gap));
    },
  },
});

export type LayoutStore = ReturnType<typeof useLayoutStore>;
