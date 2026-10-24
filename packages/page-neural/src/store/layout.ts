import {
  DEFAULT_PANEL_UNIT,
  generatePanelNode,
  nextUnit,
  applySizeValue,
} from '@neural/core/layout/utils';
import type { LayoutPanelNode, LayoutSplitterNode } from '@neural/types';
import { defineStore } from 'pinia';

// 布局编辑状态：面板/分隔器的增删操作与悬停高亮
export const useLayoutStore = defineStore('page-neural-layout', {
  state: () => ({
    // 画布当前悬停的面板 id（全局唯一，嵌套分隔器共享，避免父子分隔器各自维护导致状态残留）
    hoveredPanelId: null as string | null,
    // 图层树当前悬停的面板/分隔器 id（反向联动：树中悬停 → 画布高亮对应节点）
    treeHoveredPanelId: null as string | null,
    treeHoveredSplitterId: null as string | null,
  }),
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
    // 在分隔器指定位置新增同级面板
    addPanel(splitter: LayoutSplitterNode, index: number) {
      splitter.children.splice(index, 0, generatePanelNode());
    },
    // 删除指定面板：不限制剩余数量；删空后该嵌套分隔器已成空壳，连同它一起清除
    deletePanel(
      splitter: LayoutSplitterNode,
      parentPanel: LayoutPanelNode | undefined,
      index: number
    ) {
      splitter.children.splice(index, 1);

      if (!splitter.children.length && parentPanel) parentPanel.children = [];
    },
    // 删除分隔器：清空其所在父面板内容（根分隔器不可删除，由调用方保证）
    deleteSplitter(parentPanel: LayoutPanelNode | undefined) {
      if (!parentPanel) return;
      parentPanel.children = [];
    },
    // 循环切换面板尺寸单位；切换前先按画布实际渲染像素重算 sizeValue，避免切换瞬间尺寸跳变
    toggleUnit(splitter: LayoutSplitterNode, panel: LayoutPanelNode) {
      const panelEl = document.querySelector<HTMLElement>(`[data-panel-id="${panel.id}"]`);
      const rect = panelEl?.getBoundingClientRect();
      const panelPx = rect ? (splitter.layout === 'horizontal' ? rect.width : rect.height) : 0;

      panel.useUnit = nextUnit(panel.useUnit ?? DEFAULT_PANEL_UNIT);

      if (panelPx) {
        applySizeValue(panel, panelPx);
      }
    },
  },
});

export type LayoutStore = ReturnType<typeof useLayoutStore>;
