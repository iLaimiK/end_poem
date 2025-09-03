import { INTERNAL_KEYS } from './config/constants';
import {
  detectSecondaryCharacterChanges,
  handleCharacterUpdate,
  validateSecondaryCharacters,
} from './handlers/character-handler';
import { deduplicatePlotNodeRecords, handlePlotProgress } from './handlers/plot-handler';
import { handleMioStabilizer } from './handlers/special-handler';
import { validateAndFixValue } from './handlers/validation-handler';
import { updateWorldbookScanText } from './handlers/worldbook-handler';
import type { PendingValidation } from './types';

// 存储需要延迟验证的变量更新
const PENDING_VALIDATIONS: PendingValidation[] = [];

/**
 * 处理MVU变量更新开始事件
 * @param variables - 包含stat_data的变量记录
 * @param out_is_updated - 指示是否已有更新的标志
 */
function variableUpdateStarted(variables: Record<string, any>): void {
  console.log('Variable update started');

  // 在变量更新开始时检查并清理不允许的次要角色
  if (variables?.stat_data) {
    validateSecondaryCharacters(variables.stat_data);

    // 存储当前次要角色状态用于后续比较（存储在stat_data中确保持久性）
    const currentSecondaryCharacters = _.get(variables.stat_data, '次要角色');
    _.set(
      variables.stat_data,
      INTERNAL_KEYS.PREVIOUS_SECONDARY_CHARACTERS_KEY,
      _.cloneDeep(currentSecondaryCharacters),
    );
  }
}

/**
 * 处理MVU变量更新事件
 * @param stat_data - 包含更新变量的数据结构
 * @param path - 标识被更新变量的路径或键
 * @param oldValue - 变量更新前的值
 * @param newValue - 变量更新后的值
 */
function variableUpdated(stat_data: Record<string, any>, path: string, oldValue: any, newValue: any): void {
  console.log(`Variable updated: ${path} from ${oldValue} to ${newValue}`);

  // 记录需要验证的更新
  PENDING_VALIDATIONS.push({
    stat_data,
    path,
    oldValue,
    newValue,
  });

  // 调用各个专门的处理函数（使用原始新值）
  handleCharacterUpdate(stat_data, path, newValue);
  handlePlotProgress(stat_data, path, oldValue, newValue);
  handleMioStabilizer(stat_data, path, newValue);
}

/**
 * 处理MVU变量更新结束事件
 * @param variables - 包含状态和显示相关数据的对象
 * @param out_is_updated - 指示变量在处理过程中是否被更新的标志
 */
function variableUpdateEnded(variables: Record<string, any>): void {
  console.log('Variable update ended');

  // 现在执行延迟的数值验证
  if (PENDING_VALIDATIONS.length > 0) {
    console.log(`[延迟验证] 处理 ${PENDING_VALIDATIONS.length} 个待验证的变量更新`);

    for (const validation of PENDING_VALIDATIONS) {
      const { stat_data, path, oldValue, newValue } = validation;

      // 获取当前实际值
      const currentValue = _.get(stat_data, path);

      // 对当前值进行验证和修复
      const validatedValue = validateAndFixValue(currentValue, path, oldValue);

      if (validatedValue !== currentValue) {
        _.set(stat_data, path, validatedValue);
        console.log(`[延迟验证] 数值已修复: ${path} = ${validatedValue}`);
      }
    }

    // 清空待验证列表
    PENDING_VALIDATIONS.length = 0;
  }

  // 在变量更新结束时再次验证次要角色（确保最终一致性）
  if (variables?.stat_data) {
    validateSecondaryCharacters(variables.stat_data);

    // 剧情节点记录去重
    deduplicatePlotNodeRecords(variables.stat_data);

    // 检测次要角色变化
    const currentSecondaryCharacters = _.get(variables.stat_data, '次要角色');
    const previousSecondaryCharacters = _.get(variables.stat_data, INTERNAL_KEYS.PREVIOUS_SECONDARY_CHARACTERS_KEY);

    if (previousSecondaryCharacters && currentSecondaryCharacters) {
      detectSecondaryCharacterChanges(variables.stat_data, previousSecondaryCharacters, currentSecondaryCharacters);
    }

    // 更新存储的状态（存储在stat_data中确保持久性）
    _.set(
      variables.stat_data,
      INTERNAL_KEYS.PREVIOUS_SECONDARY_CHARACTERS_KEY,
      _.cloneDeep(currentSecondaryCharacters),
    );

    // 更新世界书扫描文本
    updateWorldbookScanText(variables.stat_data);
  }
}

// 注册MVU事件监听器
$(() => {
  eventOn('mag_variable_update_started', variableUpdateStarted);
  eventOn('mag_variable_updated', variableUpdated);
  eventOn('mag_variable_update_ended', variableUpdateEnded);

  console.log('MVU变量处理脚本已加载');
});
