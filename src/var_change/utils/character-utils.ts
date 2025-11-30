import type { CurrentTimeAndLocation } from '../types/index';

/**
 * 获取角色的标准化名字（用于记录key，避免重复）
 * @param characterName - 角色名称
 * @returns 标准化的名字
 */
export function getStandardizedRecordName(characterName: string): string {
  const normalizedInput = characterName.trim();
  // 返回输入的第一个名字
  return normalizedInput.split('·')[0].trim();
}

/**
 * 获取当前全局信息中的时间和地点
 * @param stat_data - stat_data对象
 * @returns 包含时间和地点的对象
 */
export function getCurrentTimeAndLocation(stat_data: Record<string, any>): CurrentTimeAndLocation {
  const globalInfo = _.get(stat_data, '全局信息', {});
  return {
    时间: _.get(globalInfo, '时间', ''),
    地点: _.get(globalInfo, '当前位置', ''),
    日期: _.get(globalInfo, '日期', ''),
  };
}
