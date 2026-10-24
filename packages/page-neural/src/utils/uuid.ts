import { v4 as uuidv4 } from 'uuid';

/**
 * 生成一个 UUID，可选前缀
 * @param prefix 前缀 p-页面 l-布局 c-容器 n-节点
 * @returns UUID
 */
export function generateId(prefix = '') {
  return prefix ? `${prefix}-${uuidv4()}` : uuidv4();
}
