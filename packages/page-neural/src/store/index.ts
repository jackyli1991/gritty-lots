import { CONTAINER_ROOT_ID } from '@neural/const';
import { createContainer } from '@neural/core/forms/container';
import { generateSplitterNode } from '@neural/core/layout/utils';
import type {
  Container,
  DataSource,
  LayoutPanelNode,
  Page,
  LayoutSplitterNode,
} from '@neural/types';
import { generateId } from '@neural/utils';
import { defineStore } from 'pinia';

//  `defineStore()` 的返回值的命名是自由的
// 但最好含有 store 的名字，且以 `use` 开头，以 `Store` 结尾。
// (比如 `useUserStore`，`useCartStore`，`useProductStore`)
// 第一个参数是你的应用中 Store 的唯一 ID。
export const usePageNeuralStore = defineStore('page-neural', {
  state: () => ({
    activeContainerId: '', // 当前激活的容器id
    activePageId: '', // 当前激活的页面id
    nodes: [],
    edges: [],
    containers: [] as Container[],
    // 布局树：初始仅一个根分隔器，其下为 2 个空面板
    layouts: [] as LayoutSplitterNode[],
    // 页面列表
    pages: [] as Page[],
    // 数据源列表
    dataSources: [] as DataSource[],
  }),
  getters: {
    // 返回获取容器的函数
    getContainer: (state) => (id: string) => state.containers.find((item) => item.id === id),
    // 返回获取页面的函数
    getPage: (state) => (id: string) => state.pages.find((item) => item.id === id),
    // 返回当前激活的节点属性
    activeNode: (state) => state.containers.find((item) => item.id === state.activeContainerId),
    // 当前页面
    activePage: (state) => state.pages.find((item) => item.id === state.activePageId),
    // 当前容器
    activeContainer: (state) =>
      state.containers.find((item) => item.id === state.activeContainerId),
    // 当前layout
    activeLayout(state): LayoutSplitterNode | undefined {
      return state.layouts.find((item) => item.id === this.activePage?.layoutId);
    },
  },
  actions: {
    // 初始化数据
    initData(payload: { containers: Container[]; layouts: LayoutSplitterNode[]; pages: Page[] }) {
      this.containers = payload.containers;
      this.layouts = payload.layouts;
      this.pages = payload.pages;
      if (payload.containers.length) this.setActiveContainerId(payload.containers[0].id);
      if (payload.pages.length) this.setActivePageId(payload.pages[0].id);
    },
    // 删除操作
    async onDelete(nodeType: string) {
      switch (nodeType) {
        case 'container':
          this.deleteContainer(this.activeContainerId);
          break;
        case 'page':
          // this.deletePage(this.activePageId);
          break;
        default:
          break;
      }
    },
    // 添加容器
    // addContainer(container: Container) {
    //   this.containers.push(container);
    //   // 如果有父容器，添加到父容器的子容器列表
    //   if (container.parentId) {
    //     const parent = this.containers.find((item) => item.id === container.parentId);
    //     if (parent) {
    //       parent.children.push(container.id);
    //     }
    //   }
    //   // 设置为当前激活的节点
    //   this.setActiveContainerId(container.id);
    // },
    // 复制容器
    // copyContainer(id: string) {
    //   const container = this.getContainer(id);
    //   if (!container) {
    //     return;
    //   }
    //   const newContainer = createContainer({
    //     ...container,
    //     id: generateId('c'),
    //   });
    //   this.addContainer(newContainer);
    // },
    // 删除容器
    deleteContainer(id: string) {
      const deleteContainer = this.containers.find((item) => item.id === id);
      console.log('删除容器', deleteContainer);
      if (!deleteContainer) {
        return false;
      }
      if (deleteContainer.subType === CONTAINER_ROOT_ID) {
        console.log('不能删除根容器', '拒绝');
        return false;
      }
      // 从父容器的children中删除
      if (deleteContainer.parentId) {
        const parent = this.containers.find((item) => item.id === deleteContainer.parentId);
        if (parent) {
          parent.children = parent.children.filter((child) => child !== id);
        }
      }
      this.containers = this.containers.filter((item) => item.id !== id);
      this.setActiveContainerId('');
    },
    // 设置当前激活的节点id
    setActiveContainerId(id: string) {
      this.activeContainerId = id;
    },
    // 设置当前激活的页面id
    setActivePageId(id: string) {
      this.activePageId = id;
    },
    // 新增数据源
    addDataSource(dataSource: DataSource) {
      this.dataSources.push(dataSource);
    },
    // 更新数据源（按 id 原地替换，保持列表顺序）
    updateDataSource(dataSource: DataSource) {
      const index = this.dataSources.findIndex((item) => item.id === dataSource.id);
      if (index !== -1) {
        this.dataSources[index] = dataSource;
      }
    },
    // 删除数据源
    deleteDataSource(id: string) {
      this.dataSources = this.dataSources.filter((item) => item.id !== id);
    },
    // 新增页面：为其生成独立的根布局并自动切换到该页面
    addPage(page: Page) {
      const layout = generateSplitterNode({ layout: 'vertical' });
      this.layouts.push(layout);
      // 关联页面布局
      page.layoutId = layout.id;
      this.pages.push(page);
      this.activePageId = page.id;
    },
    // 更新页面
    updatePage(page: Page) {
      const index = this.pages.findIndex((item) => item.id === page.id);
      if (index !== -1) {
        this.pages[index] = page;
      }
    },
    // 设置当前激活页面的布局锁定状态
    setLayoutLock(locked: boolean) {
      if (this.activePage) {
        this.activePage.layoutLock = locked;
      }
    },
    // 锁定布局前，确保每个叶子面板都有对应的根容器（缺失则生成并双向关联）
    ensureLayoutContainers() {
      const layout = this.activeLayout;
      if (!layout) return;

      // 收集所有叶子面板：LayoutPanelNode.children 为空即为叶子
      const leafPanels: LayoutPanelNode[] = [];
      const walk = (splitter: LayoutSplitterNode) => {
        for (const panel of splitter.children) {
          if (panel.children.length === 0) {
            leafPanels.push(panel);
          } else {
            // 有嵌套分隔器，递归进入
            walk(panel.children[0]);
          }
        }
      };
      walk(layout);

      for (const panel of leafPanels) {
        // 确保 panel.containerId 有值
        if (!panel.containerId) {
          panel.containerId = generateId('c');
        }
        // 容器不存在才生成
        if (!this.containers.some((c) => c.id === panel.containerId)) {
          const container = createContainer({
            id: panel.containerId,
            name: `面板容器-${panel.containerId.slice(-4)}`,
            subType: CONTAINER_ROOT_ID,
            props: {
              boxModel: {
                width: 100,
                height: 100,
              },
            },
          });
          this.containers.push(container);
        }
      }
    },
  },
});

export type PageNeuralStore = ReturnType<typeof usePageNeuralStore>;
