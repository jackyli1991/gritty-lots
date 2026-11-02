import { createPage } from '@neural/core/forms/page';
import type { PageNeuralStore } from '@neural/store';
// import { initialContainers, initialLayouts, initialPages } from '../mockData';

/**
 * 初始化 page-neural 数据：使用预置的 mock 数据填充 store，激活首个页面与容器。
 * 幂等：若已存在页面则直接返回，避免重复初始化。
 * @param store page-neural store 实例
 */
export function initPageNeural(store: PageNeuralStore) {
  if (store.pages.length) return;

  const initialPage = createPage({ name: '初始页面' });
  store.addPage(initialPage);

  // store.initData({
  //   containers: [],
  //   layouts: [],
  //   pages: [],
  // });
}
