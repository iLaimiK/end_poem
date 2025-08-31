import { ALLOWED_SECONDARY_CHARACTERS } from '../config/characters';
import type { CurrentTimeAndLocation } from '../types/index';

/**
 * 获取角色的标准化名字（用于记录key，避免重复）
 * @param characterName - 角色名称
 * @returns 标准化的名字
 */
export function getStandardizedRecordName(characterName: string): string {
  const normalizedInput = characterName.trim();
  // 返回输入的第一个名字
  const fallbackName = normalizedInput.split(' (')[0].trim();
  return fallbackName.split('·')[0].trim();
}

/**
 * 检查次要角色是否在允许列表中
 * @param characterName - 角色名称
 * @returns 是否允许该角色
 */
export function isAllowedSecondaryCharacter(characterName: string): boolean {
  // 支持多种匹配方式
  const normalizedInput = characterName.trim();

  // 1. 完全匹配
  if (ALLOWED_SECONDARY_CHARACTERS.includes(normalizedInput)) {
    return true;
  }

  // 2. 去除括号后匹配（匹配主名称）
  for (const allowedChar of ALLOWED_SECONDARY_CHARACTERS) {
    const mainName = allowedChar.split(' (')[0].trim();
    const inputMainName = normalizedInput.split(' (')[0].trim();
    if (mainName === inputMainName) {
      return true;
    }
  }

  // 3. 检查名字匹配（如'莉瑟尔'、'艾露薇娅'）
  for (const allowedChar of ALLOWED_SECONDARY_CHARACTERS) {
    const mainName = allowedChar.split(' (')[0].trim();

    // 提取第一个名字（通常是·分隔的第一部分）
    const firstName = mainName.split('·')[0].trim();

    // 检查输入是否匹配第一个名字
    if (firstName === normalizedInput) {
      return true;
    }
  }

  return false;
}

/**
 * 获取当前全局信息中的时间和地点
 * @param stat_data - stat_data对象
 * @returns 包含时间和地点的对象
 */
export function getCurrentTimeAndLocation(stat_data: Record<string, any>): CurrentTimeAndLocation {
  const globalInfo = _.get(stat_data, "全局信息", {});
  return {
    时间: _.get(globalInfo, "时间", ""),
    地点: _.get(globalInfo, "当前位置", ""),
    日期: _.get(globalInfo, "日期", "")
  };
}