import { CHANGE_LIMITS } from '../config/change-limits';
import { VALUE_CONSTRAINTS } from '../config/value-constraints';
import type { ChangeLimitConfig, NumberConstraintFunction } from '../types/index';
import { checkTypeCompatibility, generateTypeWarningMessage } from '../utils/type-utils';

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
 * 获取对应的约束函数
 * @param path - 变量路径
 * @returns 对应的约束函数
 */
export function getConstraintForPath(path: string): NumberConstraintFunction | null {
  // 直接匹配
  if (VALUE_CONSTRAINTS[path]) {
    return VALUE_CONSTRAINTS[path];
  }

  // 模式匹配
  if (path.includes('次要角色') && path.endsWith('.信任值')) {
    return VALUE_CONSTRAINTS.pattern_信任值;
  }

  if (path.includes('特殊角色')) {
    if (path.endsWith('.好感度')) {
      return VALUE_CONSTRAINTS.pattern_好感度;
    } else if (path.endsWith('.依赖度')) {
      return VALUE_CONSTRAINTS.pattern_依赖度;
    } else if (path.endsWith('.认可度')) {
      return VALUE_CONSTRAINTS.pattern_认可度;
    } else if (path.endsWith('.污秽侵蚀度')) {
      return VALUE_CONSTRAINTS.pattern_污秽侵蚀度;
    } else if (path.endsWith('.模因侵蚀率')) {
      return VALUE_CONSTRAINTS.pattern_模因侵蚀率;
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
 * 检查类型兼容性并显示警告
 * @param path - 变量路径
 * @param oldValue - 旧值
 * @param newValue - 新值
 */
export function checkAndWarnTypeCompatibility(path: string, oldValue: any, newValue: any): void {
  // 跳过 null/undefined 的旧值检查
  if (oldValue === null || oldValue === undefined) {
    return;
  }

  const typeCheck = checkTypeCompatibility(oldValue, newValue);

  if (!typeCheck.compatible) {
    const warningMessage = generateTypeWarningMessage(path, oldValue, newValue, typeCheck);

    // 使用 toastr 显示警告
    if (typeof toastr !== 'undefined') {
      toastr.warning(warningMessage, '类型不匹配警告', {
        timeOut: 10000, // 10秒后自动消失
        extendedTimeOut: 5000,
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-center',
      });
    } else {
      // 降级到控制台警告
      console.warn(`[类型检查警告] ${warningMessage}`);
    }

    // 同时记录到控制台用于调试
    console.warn(`[类型不匹配] ${path}: ${typeCheck.oldType} -> ${typeCheck.newType}`, {
      oldValue,
      newValue,
      reason: typeCheck.reason,
    });
  }
}

/**
 * 验证和修复数值
 * @param value - 要验证的值
 * @param path - 变量路径
 * @param oldValue - 旧值
 * @returns 修复后的值
 */
export function validateAndFixValue(value: any, path: string, oldValue: any = null): any {
  const constraint = getConstraintForPath(path);
  const changeLimit = getChangeLimitForPath(path);

  if (!constraint) {
    return value;
  }

  try {
    // 基本的类型转换和范围限制
    let result = constraint(value);

    // 应用变化幅度限制
    if (changeLimit && oldValue !== null && typeof oldValue === 'number') {
      result = applyChangeLimit(result, oldValue, changeLimit, path);

      // 确保限制后的值仍在约束范围内
      result = constraint(result);
    }

    // 记录修复日志（如果值有变化）
    if (result !== value) {
      const fixType = typeof value !== 'number' ? '类型转换' : '范围限制';
      console.log(`数值修复: ${path} 从 ${value} ${fixType}为 ${result}`);
    }

    return result;
  } catch (error) {
    console.error(`数值验证失败: ${path} = ${value}`, error instanceof Error ? error.message : String(error));
    return value; // 验证失败时保留原值
  }
}
