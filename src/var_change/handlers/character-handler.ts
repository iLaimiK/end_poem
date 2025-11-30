import type { CharacterRecord } from '../types/index';
import { getCurrentTimeAndLocation, getStandardizedRecordName } from '../utils/character-utils';

/**
 * 处理次要角色出场
 * @param stat_data - stat_data对象
 * @param characterName - 角色名称
 */
export function handleSecondaryCharacterEntry(stat_data: Record<string, any>, characterName: string): void {
  if (!_.has(stat_data, '次要角色记录')) {
    _.set(stat_data, '次要角色记录', {});
  }

  const currentInfo = getCurrentTimeAndLocation(stat_data);

  // 使用标准化的名字作为记录key，避免同一人物多次记录
  const standardizedName = getStandardizedRecordName(characterName);
  const recordPath = `次要角色记录.${standardizedName}`;
  const characterPath = `次要角色.${characterName}`;

  // 检查是否已有记录
  const characterRecord = _.get(stat_data, recordPath);
  const isReturning = characterRecord && typeof characterRecord === 'object';

  if (isReturning) {
    // 角色重新出场 - 恢复信任值
    console.log(`[次要角色管理] ${characterName} (记录名: ${standardizedName}) 重新出场，恢复记录信息`);

    // 恢复信任值
    const savedTrustValue = _.get(characterRecord, '信任值', 0.01);
    if (_.has(stat_data, `${characterPath}.信任值`)) {
      _.set(stat_data, `${characterPath}.信任值`, savedTrustValue);
      console.log(`[次要角色管理] 恢复 ${characterName} 的信任值: ${savedTrustValue}`);
    }

    // 恢复物品（合并，新物品优先）
    const savedItems = _.get(characterRecord, '离场时持有的物品', {});
    const currentItems = _.get(stat_data, `${characterPath}.持有物品`, {});

    if (Object.keys(savedItems).length > 0) {
      // 合并物品：当前物品优先，然后添加之前的物品
      const mergedItems = { ...savedItems, ...currentItems };

      _.set(stat_data, `${characterPath}.持有物品`, mergedItems);
      console.log(`[次要角色管理] 恢复 ${characterName} 的物品，合并${Object.keys(savedItems).length}件之前的物品`);
    }

    // 更新出场信息
    _.set(stat_data, `${recordPath}.出场次数`, _.get(characterRecord, '出场次数', 0) + 1);
    _.set(stat_data, `${recordPath}.出场地点`, currentInfo.地点);
    _.set(stat_data, `${recordPath}.出场时间`, `${currentInfo.日期} ${currentInfo.时间}`);
    _.set(stat_data, `${recordPath}.离场地点`, '待定');
    _.set(stat_data, `${recordPath}.离场时间`, 'N/A');
  } else {
    // 首次出场 - 创建新记录
    console.log(`[次要角色管理] ${characterName} (记录名: ${standardizedName}) 首次出场，创建新记录`);

    const newRecord: CharacterRecord = {
      出场次数: 1,
      出场地点: currentInfo.地点,
      出场时间: `${currentInfo.日期} ${currentInfo.时间}`,
      离场地点: '待定',
      离场时间: 'N/A',
      信任值: _.get(stat_data, `${characterPath}.信任值`, 0.01),
      离场时持有的物品: {},
    };

    _.set(stat_data, recordPath, newRecord);
  }

  console.log(`[次要角色管理] ${characterName} 出场记录已更新`);
}

/**
 * 处理次要角色离场
 * @param stat_data - stat_data对象
 * @param characterName - 角色名称
 * @param characterData - 角色数据（离场前的数据）
 */
export function handleSecondaryCharacterExit(
  stat_data: Record<string, any>,
  characterName: string,
  characterData: Record<string, any>,
): void {
  if (!_.has(stat_data, '次要角色记录')) {
    _.set(stat_data, '次要角色记录', {});
  }

  const currentInfo = getCurrentTimeAndLocation(stat_data);

  // 使用标准化的名字作为记录key
  const standardizedName = getStandardizedRecordName(characterName);
  const recordPath = `次要角色记录.${standardizedName}`;

  console.log(`[次要角色管理] ${characterName} (记录名: ${standardizedName}) 离场，保存当前状态`);

  // 确保有基础记录
  if (!_.has(stat_data, recordPath)) {
    const defaultRecord: CharacterRecord = {
      出场次数: 1,
      出场地点: '',
      出场时间: '',
      离场地点: '待定',
      离场时间: 'N/A',
      信任值: 0.01,
      离场时持有的物品: {},
    };
    _.set(stat_data, recordPath, defaultRecord);
  }

  // 保存离场信息
  _.set(stat_data, `${recordPath}.离场地点`, currentInfo.地点);
  _.set(stat_data, `${recordPath}.离场时间`, `${currentInfo.日期} ${currentInfo.时间}`);

  // 保存当前信任值
  const currentTrust = _.get(characterData, '信任值', 0.01);
  _.set(stat_data, `${recordPath}.信任值`, currentTrust);

  // 保存当前持有物品
  const currentItems = _.get(characterData, '持有物品', {});
  _.set(stat_data, `${recordPath}.离场时持有的物品`, currentItems);

  console.log(
    `[次要角色管理] ${characterName} 离场状态已保存 - 信任值: ${currentTrust}, 物品数量: ${Object.keys(currentItems).length}`,
  );
}

/**
 * 检测次要角色的变化（添加/删除）
 * @param stat_data - stat_data对象
 * @param oldSecondaryCharacters - 旧的次要角色对象
 * @param newSecondaryCharacters - 新的次要角色对象
 */
export function detectSecondaryCharacterChanges(
  stat_data: Record<string, any>,
  oldSecondaryCharacters: Record<string, any>,
  newSecondaryCharacters: Record<string, any>,
): void {
  if (!oldSecondaryCharacters || !newSecondaryCharacters) {
    return;
  }

  const oldCharNames = Object.keys(oldSecondaryCharacters);
  const newCharNames = Object.keys(newSecondaryCharacters);

  // 检测新增角色（出场）
  const addedCharacters = newCharNames.filter(name => !oldCharNames.includes(name));
  for (const characterName of addedCharacters) {
    handleSecondaryCharacterEntry(stat_data, characterName);
  }

  // 检测删除角色（离场）
  const removedCharacters = oldCharNames.filter(name => !newCharNames.includes(name));
  for (const characterName of removedCharacters) {
    const characterData = oldSecondaryCharacters[characterName];
    handleSecondaryCharacterExit(stat_data, characterName, characterData);
  }
}
