/**
 * 去除数组中的重复文本
 * @param array - 需要去重的数组
 * @returns 去重后的数组
 */
export function removeDuplicateTexts(array: any[]): any[] {
  if (!Array.isArray(array)) {
    return array;
  }

  const seen = new Set<string>();
  const filtered: any[] = [];

  for (const item of array) {
    // 对于文本类型，进行去重
    if (typeof item === 'string') {
      const trimmedItem = item.trim();
      if (trimmedItem && !seen.has(trimmedItem)) {
        seen.add(trimmedItem);
        filtered.push(item);
      }
    } else {
      // 对于非字符串类型，直接添加（保持原有逻辑）
      filtered.push(item);
    }
  }

  return filtered;
}
