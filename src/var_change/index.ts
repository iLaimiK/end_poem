import { INTERNAL_KEYS } from './config/constants';
import { detectSecondaryCharacterChanges } from './handlers/character-handler';
import { handlePlotProgress } from './handlers/plot-handler';
import { handleMioStabilizer } from './handlers/special-handler';
import { applyChangeLimitToValue } from './handlers/validation-handler';
import { updateWorldbookScanText } from './handlers/worldbook-handler';
import type { PendingValidation } from './types';

// 存储需要延迟处理的变化幅度限制
const PENDING_CHANGE_LIMITS: PendingValidation[] = [];

/**
 * 处理MVU变量更新开始事件
 * @param variables - 包含stat_data的变量记录
 * @param out_is_updated - 指示是否已有更新的标志
 */
function variableUpdateStarted(variables: Record<string, any>): void {
  console.log('Variable update started');

  // 存储当前次要角色状态用于后续比较（存储在stat_data中确保持久性）
  if (variables?.stat_data) {
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

  // 记录需要应用变化幅度限制的更新
  PENDING_CHANGE_LIMITS.push({
    stat_data,
    path,
    oldValue,
    newValue,
  });

  // 调用各个专门的处理函数
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

  // 应用变化幅度限制（在 Zod 验证后执行）
  if (PENDING_CHANGE_LIMITS.length > 0) {
    console.log(`[变化幅度限制] 处理 ${PENDING_CHANGE_LIMITS.length} 个待限制的变量更新`);

    for (const validation of PENDING_CHANGE_LIMITS) {
      const { stat_data, path, oldValue, newValue } = validation;

      // 获取当前实际值
      const currentValue = _.get(stat_data, path);

      // 应用变化幅度限制
      const limitedValue = applyChangeLimitToValue(currentValue, path, oldValue);

      if (limitedValue !== currentValue) {
        _.set(stat_data, path, limitedValue);
        console.log(`[变化幅度限制] 已应用限制: ${path} = ${limitedValue}`);
      }
    }

    // 清空待处理列表
    PENDING_CHANGE_LIMITS.length = 0;
  }

  if (variables?.stat_data) {
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
