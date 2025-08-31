import type { NumberConstraintFunction } from '../types/index';

/**
 * 格式化浮点数，精确到小数点后5位并去除尾随零
 * @param value - 需要格式化的浮点数
 * @returns 格式化后的数值
 */
export function formatFloat(value: number): number {
  // 保留5位小数，然后转换为数字以去除尾随零
  return parseFloat(value.toFixed(5));
}

/**
 * 创建原生数值约束函数
 * @param min - 最小值
 * @param max - 最大值
 * @param isInteger - 是否为整数，默认false
 * @returns 约束函数
 */
export function createNumberConstraint(min: number, max: number, isInteger = false): NumberConstraintFunction {
  return (value: any): number => {
    // 强制转换为数字
    let numValue = Number(value);

    // 如果转换失败，返回最小值
    if (isNaN(numValue)) {
      console.warn(`[数值变化限制] 无法将值转换为数字：${value}`);
      numValue = min;
    }

    // 范围限制
    let clampedVal = Math.max(min, Math.min(max, numValue));

    // 如果是整数，确保结果也是整数
    if (isInteger) {
      clampedVal = Math.round(clampedVal);
    } else {
      clampedVal = formatFloat(clampedVal);
    }

    return clampedVal;
  };
}