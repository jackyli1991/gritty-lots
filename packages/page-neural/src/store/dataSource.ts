import { defineStore } from 'pinia';

/** 容器 / 组件 / 页面请求后的数据源响应记录 */
export interface DataSourceResponse {
  /** 发起请求的容器 / 组件 / 页面 id */
  originId: string;
  /** 数据源 id */
  sourceId: string;
  /** fetchDataSource 返回的原始响应，不做容器级 responseField 解析 */
  data: unknown;
}

/** 按请求方 id 与数据源 id 统一缓存接口响应 */
export const useDataSourceStore = defineStore('page-neural-data-source', {
  state: () => ({
    responses: [] as DataSourceResponse[],
  }),
  getters: {
    getResponse:
      (state) =>
      (originId: string, sourceId = ''): DataSourceResponse | undefined =>
        state.responses.find((item) => item.originId === originId && item.sourceId === sourceId),
  },
  actions: {
    /** 新增或替换同一请求方、同一数据源的响应 */
    setResponse(response: DataSourceResponse) {
      const index = this.responses.findIndex(
        (item) => item.originId === response.originId && item.sourceId === response.sourceId
      );
      if (index === -1) {
        this.responses.push(response);
        return;
      }
      this.responses[index] = response;
    },
  },
});
