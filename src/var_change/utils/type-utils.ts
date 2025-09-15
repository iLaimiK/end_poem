/**
 * 类型检查工具函数
 */

/**
 * 获取数组内容的类型摘要
 * @param arr - 数组
 * @returns 数组内容类型描述
 */
function getArrayContentType(arr: any[]): string {
  if (arr.length === 0) return 'empty';

  const types = new Set<string>();
  for (const item of arr) {
    types.add(getDetailedType(item));
  }

  const typeArray = Array.from(types).sort((a, b) => a.localeCompare(b));
  if (typeArray.length === 1) {
    return typeArray[0];
  }
  return `mixed(${typeArray.join('|')})`;
}

/**
 * 获取值的详细类型信息
 * @param value - 要检查的值
 * @returns 详细的类型描述
 */
export function getDetailedType(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const basicType = typeof value;

  if (basicType === 'object') {
    if (Array.isArray(value)) {
      const contentType = getArrayContentType(value);
      return `array[${value.length}]<${contentType}>`;
    }
    return 'object';
  }

  if (basicType === 'number') {
    if (Number.isInteger(value)) {
      return 'integer';
    }
    return 'float';
  }

  // JSON 中只支持这些基础类型
  if (basicType === 'string' || basicType === 'boolean') {
    return basicType;
  }

  // 其他类型在 JSON 中不应该出现
  return 'unknown';
}

/**
 * 检查两个值的类型是否兼容
 * @param oldValue - 旧值
 * @param newValue - 新值
 * @returns 类型检查结果
 */
export function checkTypeCompatibility(
  oldValue: any,
  newValue: any,
): {
  compatible: boolean;
  oldType: string;
  newType: string;
  reason?: string;
} {
  const oldType = getDetailedType(oldValue);
  const newType = getDetailedType(newValue);

  // 完全相同的类型
  if (oldType === newType) {
    return { compatible: true, oldType, newType };
  }

  // 数值类型兼容性检查
  const numericTypes = ['integer', 'float'];
  if (numericTypes.includes(oldType) && numericTypes.includes(newType)) {
    // integer 和 float 兼容
    return { compatible: true, oldType, newType };
  }

  // 数组类型兼容性检查
  if (oldType.startsWith('array[') && newType.startsWith('array[')) {
    // 提取数组长度和内容类型
    const oldMatch = RegExp(/^array\[(\d+)\]<(.+)>$/).exec(oldType);
    const newMatch = RegExp(/^array\[(\d+)\]<(.+)>$/).exec(newType);

    if (oldMatch && newMatch) {
      const [, oldLength, oldContentType] = oldMatch;
      const [, newLength, newContentType] = newMatch;

      // 空数组到任何数组都兼容
      if (oldContentType === 'empty') {
        return { compatible: true, oldType, newType };
      }

      // 长度变化超过合理范围时警告
      const lengthDiff = Math.abs(parseInt(newLength) - parseInt(oldLength));
      if (lengthDiff > 10) {
        return {
          compatible: false,
          oldType,
          newType,
          reason: `数组长度变化过大 (${oldLength} -> ${newLength})`,
        };
      }

      // 内容类型兼容性检查
      if (oldContentType !== newContentType) {
        // 同质数组变为混合数组
        if (newContentType.startsWith('mixed(')) {
          return {
            compatible: false,
            oldType,
            newType,
            reason: `数组内容从单一类型变为混合类型`,
          };
        }

        // 不同的单一类型
        return {
          compatible: false,
          oldType,
          newType,
          reason: `数组内容类型从 ${oldContentType} 变为 ${newContentType}`,
        };
      }

      return { compatible: true, oldType, newType };
    }
  }

  // null 和 undefined 的特殊处理
  if ((oldType === 'null' || oldType === 'undefined') && newType !== 'null' && newType !== 'undefined') {
    return { compatible: true, oldType, newType }; // 从空值到有值是允许的
  }

  // 字符串和数字的转换检查
  if (oldType === 'string' && numericTypes.includes(newType)) {
    return {
      compatible: false,
      oldType,
      newType,
      reason: '字符串类型不应直接变为数值类型',
    };
  }

  if (numericTypes.includes(oldType) && newType === 'string') {
    return {
      compatible: false,
      oldType,
      newType,
      reason: '数值类型不应直接变为字符串类型',
    };
  }

  // 基础类型到复杂类型的转换
  const basicTypes = ['string', 'boolean', 'integer', 'float'];
  const complexTypes = ['object'];

  if (basicTypes.includes(oldType) && (complexTypes.includes(newType) || newType.startsWith('array['))) {
    return {
      compatible: false,
      oldType,
      newType,
      reason: `基础类型 ${oldType} 不应变为复杂类型 ${newType}`,
    };
  }

  // 复杂类型到基础类型的转换
  if ((complexTypes.includes(oldType) || oldType.startsWith('array[')) && basicTypes.includes(newType)) {
    return {
      compatible: false,
      oldType,
      newType,
      reason: `复杂类型 ${oldType} 不应变为基础类型 ${newType}`,
    };
  }

  // 布尔值的特殊处理
  if (oldType === 'boolean' && newType !== 'boolean') {
    return {
      compatible: false,
      oldType,
      newType,
      reason: '布尔值不应变为其他类型',
    };
  }

  if (oldType !== 'boolean' && newType === 'boolean') {
    return {
      compatible: false,
      oldType,
      newType,
      reason: '其他类型不应变为布尔值',
    };
  }

  // 其他类型不兼容
  return {
    compatible: false,
    oldType,
    newType,
    reason: `类型从 ${oldType} 变为 ${newType} 可能存在问题`,
  };
}

/**
 * 生成类型不兼容的提示消息
 * @param path - 变量路径
 * @param oldValue - 旧值
 * @param newValue - 新值
 * @param typeCheck - 类型检查结果
 * @returns 格式化的提示消息
 */
export function generateTypeWarningMessage(
  path: string,
  oldValue: any,
  newValue: any,
  typeCheck: ReturnType<typeof checkTypeCompatibility>,
): string {
  const { oldType, newType, reason } = typeCheck;

  let message = `变量类型不匹配警告\n`;
  message += `路径: ${path}\n`;
  message += `旧值: ${JSON.stringify(oldValue)} (${oldType})\n`;
  message += `新值: ${JSON.stringify(newValue)} (${newType})\n`;

  if (reason) {
    message += `原因: ${reason}\n`;
  }

  message += `\n建议: 请检查该变量的更新文本，或考虑重 roll 此消息`;

  return message;
}
