import { CHANGE_LIMITS } from '../config/change-limits';
import type { ChangeLimitConfig } from '../types/index';

/**
 * 获取变化限制配置
 * @param path - 变量路径
 * @returns 对应的变化限制配置
 */
export function getChangeLimitForPath(path: string): ChangeLimitConfig | null {
  // 直接匹配
  if (CHANGE_LIMITS[path]) {
    return CHANGE_LIMITS[path];
  }

  // 模式匹配
  if (path.includes('次要角色') && path.endsWith('.信任值')) {
    return CHANGE_LIMITS.pattern_信任值;
  }

  if (path.includes('特殊角色')) {
    if (path.endsWith('.好感度')) {
      return CHANGE_LIMITS.pattern_好感度;
    } else if (path.endsWith('.依赖度')) {
      return CHANGE_LIMITS.pattern_依赖度;
    } else if (path.endsWith('.认可度')) {
      return CHANGE_LIMITS.pattern_认可度;
    } else if (path.endsWith('.污秽侵蚀度')) {
      return CHANGE_LIMITS.pattern_污秽侵蚀度;
    } else if (path.endsWith('.模因侵蚀率')) {
      return CHANGE_LIMITS.pattern_模因侵蚀率;
    }
  }

  return null;
}

/**
 * 应用变化幅度限制
 * @param newValue - 新值
 * @param oldValue - 旧值
 * @param changeLimit - 变化限制配置
 * @param path - 变量路径（用于日志）
 * @returns 限制后的值
 */
export function applyChangeLimit(
  newValue: number,
  oldValue: number,
  changeLimit: ChangeLimitConfig,
  path: string,
): number {
  const actualChange = newValue - oldValue;

  // 特殊处理：正向无限制变化（澪的治愈进度）
  if (changeLimit.maxChange === Number.POSITIVE_INFINITY) {
    if (actualChange < 0 && actualChange < changeLimit.minChange) {
      const limitedValue = oldValue + changeLimit.minChange;
      console.log(`变化幅度限制: ${path} 负向变化 ${actualChange.toFixed(5)} 限制为 ${changeLimit.minChange}`);
      return limitedValue;
    }
    return newValue; // 正向变化无限制
  }

  // 标准双向变化限制
  if (actualChange > changeLimit.maxChange) {
    const limitedValue = oldValue + changeLimit.maxChange;
    console.log(`变化幅度限制: ${path} 正向变化 ${actualChange.toFixed(5)} 限制为 ${changeLimit.maxChange}`);
    return limitedValue;
  }

  if (actualChange < changeLimit.minChange) {
    const limitedValue = oldValue + changeLimit.minChange;
    console.log(`变化幅度限制: ${path} 负向变化 ${actualChange.toFixed(5)} 限制为 ${changeLimit.minChange}`);
    return limitedValue;
  }

  return newValue; // 在允许范围内
}

/**
 * 应用变化幅度限制到数值
 * @param value - 当前值
 * @param path - 变量路径
 * @param oldValue - 旧值
 * @returns 应用变化幅度限制后的值
 */
export function applyChangeLimitToValue(value: any, path: string, oldValue: any): any {
  // 只处理数值类型
  if (typeof value !== 'number' || typeof oldValue !== 'number') {
    return value;
  }

  const changeLimit = getChangeLimitForPath(path);
  if (!changeLimit) {
    return value;
  }

  const limitedValue = applyChangeLimit(value, oldValue, changeLimit, path);

  return limitedValue;
}
