import { CONTAINER_ROOT_ID } from '@neural/const';
import { generateContainer } from '@neural/core/crud/utils';
import { generateSplitterNode } from '@neural/core/layout/utils';
import type { Container, Page, LayoutSplitterNode } from '@neural/types';
import { generateId } from '@neural/utils/uuid';
import { defineStore } from 'pinia';

//  `defineStore()` 的返回值的命名是自由的
// 但最好含有 store 的名字，且以 `use` 开头，以 `Store` 结尾。
// (比如 `useUserStore`，`useCartStore`，`useProductStore`)
// 第一个参数是你的应用中 Store 的唯一 ID。
export const usePageNeuralStore = defineStore('page-neural', {
  state: () => ({
    activeNodeId: '', // 当前激活的节点id
    activePageId: '', // 当前激活的页面id
    nodes: [],
    edges: [],
    containers: [
      // 页面根容器
      // generateContainer({
      //   id: CONTAINER_ROOT_ID,
      //   name: '页面根容器',
      //   subType: '',
      //   props: {
      //     width: 100,
      //     height: 100,
      //   },
      // }),
    ] as Container[],
    // 布局树：初始仅一个根分隔器，其下为 2 个空面板
    layouts: [] as LayoutSplitterNode[],
    // 页面列表
    pages: [] as Page[],
  }),
  getters: {
    // 返回获取容器的函数
    getContainer: (state) => (id: string) => state.containers.find((item) => item.id === id),
    // 返回当前激活的节点属性
    activeNode: (state) => state.containers.find((item) => item.id === state.activeNodeId),
    // 当前页面
    activePage: (state) => state.pages.find((item) => item.id === state.activePageId),
    // 当前layout
    activeLayout(state): LayoutSplitterNode | undefined {
      return state.layouts.find((item) => item.id === this.activePage?.layoutId);
    },
  },
  actions: {
    // 添加容器
    addContainer(container: Container) {
      this.containers.push(container);
      // 如果有父容器，添加到父容器的子容器列表
      if (container.parentId) {
        const parent = this.containers.find((item) => item.id === container.parentId);
        if (parent) {
          parent.children.push(container.id);
        }
      }
      // 设置为当前激活的节点
      this.setActiveNodeId(container.id);
    },
    // 复制容器
    copyContainer(id: string) {
      const container = this.getContainer(id);
      if (!container) {
        return;
      }
      const newContainer = generateContainer({
        ...container,
        id: generateId('c'),
      });
      this.addContainer(newContainer);
    },
    // 删除容器
    deleteContainer(id: string) {
      if (id === CONTAINER_ROOT_ID) {
        return;
      }
      // 从父容器的children中删除
      const deleteContainer = this.containers.find((item) => item.id === id);
      if (deleteContainer && deleteContainer.parentId) {
        const parent = this.containers.find((item) => item.id === deleteContainer.parentId);
        if (parent) {
          parent.children = parent.children.filter((child) => child !== id);
        }
      }
      this.containers = this.containers.filter((item) => item.id !== id);
      this.setActiveNodeId('');
    },
    // 设置当前激活的节点id
    setActiveNodeId(id: string) {
      this.activeNodeId = id;
    },
    // 设置当前激活的页面id
    setActivePageId(id: string) {
      this.activePageId = id;
    },
    // 新增页面：为其生成独立的根布局并自动切换到该页面
    addPage() {
      const layout = generateSplitterNode({ layout: 'vertical' });
      this.layouts.push(layout);

      const page: Page = {
        id: generateId('p'),
        name: `页面 ${this.pages.length + 1}`,
        description: '',
        layoutLock: false,
        deletable: true,
        layoutId: layout.id,
      };
      this.pages.push(page);
      this.activePageId = page.id;
    },
    // 设置当前激活页面的布局锁定状态
    setLayoutLock(locked: boolean) {
      if (this.activePage) {
        this.activePage.layoutLock = locked;
      }
    },
    // 局部更新容器 props（浅合并）
    updateContainerProps(id: string, partial: Record<string, any>) {
      const container = this.getContainer(id);
      if (!container) return;
      container.props = { ...container.props, ...partial };
    },
  },
});

export type PageNeuralStore = ReturnType<typeof usePageNeuralStore>;
