/**
 * 判断值是否可继续按 key 遍历（非 null 的对象/数组）
 */
function isTraversable(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

/**
 * 把路径字符串解析为键数组，支持：
 * - 点号分隔：'a.b.c'
 * - 数组下标：'a[0].b' 或 'a.0.b'
 * - 混合：'items[0].name'
 */
function parsePath(path: string): string[] {
  // 把 'a[0].b' 归一为 'a.0.b'，再按点号切分
  return path
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
}

/**
 * 根据路径安全地获取对象的值
 * @param obj - 目标对象
 * @param path - 路径，如 'a.b.c'、'items[0].name'
 * @param fallback - 取值失败或值为 undefined 时的兜底返回值
 * @returns 路径对应的值或 fallback
 *
 * 语义对齐 lodash _.get：路径中任意一层不存在 / 非对象时返回 undefined（或 fallback），
 * 不会返回中途遇到的非对象值。
 */
export function getObjectValueByPath<T = any>(
  obj: Record<string, any> | null | undefined,
  path: string,
  fallback?: T
): T | undefined {
  if (obj == null || !path) return fallback;

  const keys = parsePath(path);
  let current: unknown = obj;

  for (const key of keys) {
    if (!isTraversable(current)) {
      return fallback;
    }
    current = current[key];
  }

  return current === undefined ? fallback : (current as T);
}
