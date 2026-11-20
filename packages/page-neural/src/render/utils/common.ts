/** 枚举项：label 为展示文本，value 为匹配值 */
export interface EnumOption {
  label: string;
  value: unknown;
}

/**
 * 从枚举数据中按 value 匹配提取 label
 * @param data 枚举数据（label/value 数组）
 * @param value 待匹配的值
 * @returns 匹配项的 label；未匹配或数据不是数组时返回 undefined
 */
export function getEnumLabel(data: unknown, value: unknown): string | undefined {
  if (!Array.isArray(data)) return undefined;
  const option = data.find(
    (item): item is EnumOption =>
      !!item && typeof item === 'object' && (item as EnumOption).value === value
  );
  return option?.label;
}
