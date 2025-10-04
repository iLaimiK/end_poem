import { removeDuplicateTexts } from '../utils/array-utils';

/**
 * 对所有数组类型的变量进行去重处理
 * @param stat_data - stat_data对象
 */
export function deduplicateAllArrayVariables(stat_data: Record<string, any>): void {
  const arrayPaths: string[] = [];

  // 收集主要角色的数组变量路径
  const mainCharacters = ['<user>', '白', '澪'];
  for (const char of mainCharacters) {
    if (_.has(stat_data, `主要角色.${char}`)) {
      arrayPaths.push(`主要角色.${char}.身份`);
      // 白没有当前状态，其他主要角色有
      if (char !== '白') {
        arrayPaths.push(`主要角色.${char}.当前状态`);
      }
    }
  }

  // 收集特殊角色的数组变量路径
  const specialCharacters = ['Lily', '布施翠', '蛭子小比奈'];
  for (const char of specialCharacters) {
    if (_.has(stat_data, `特殊角色.${char}`)) {
      arrayPaths.push(`特殊角色.${char}.身份`);
      arrayPaths.push(`特殊角色.${char}.当前状态`);
    }
  }

  // 对所有数组变量进行去重
  let totalDeduplicated = 0;
  for (const path of arrayPaths) {
    const arrayValue = _.get(stat_data, path);
    if (Array.isArray(arrayValue) && arrayValue.length > 0) {
      const originalLength = arrayValue.length;
      const deduplicated = removeDuplicateTexts(arrayValue);

      if (deduplicated.length !== originalLength) {
        _.set(stat_data, path, deduplicated);
        totalDeduplicated += originalLength - deduplicated.length;
        console.log(`[数组去重] ${path}: 去除 ${originalLength - deduplicated.length} 个重复项`);
      }
    }
  }

  if (totalDeduplicated > 0) {
    console.log(`[数组去重] 总共去除 ${totalDeduplicated} 个重复项`);
  }
}