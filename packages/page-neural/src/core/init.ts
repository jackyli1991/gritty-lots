import type { PageNeuralStore } from '@neural/store';

import { initialContainers, initialLayouts, initialPages } from '../mockData';

/**
 * 初始化 page-neural 数据：使用预置的 mock 数据填充 store，激活首个页面与容器。
 * 幂等：若已存在页面则直接返回，避免重复初始化。
 * @param store page-neural store 实例
 */
export function initPageNeural(store: PageNeuralStore) {
  if (store.pages.length) return;

  store.initData({
    containers: initialContainers,
    layouts: initialLayouts,
    pages: initialPages,
  });
}
