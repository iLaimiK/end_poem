import { removeDuplicateTexts } from '../utils/array-utils';

/**
 * 处理剧情节点记录去重
 * @param stat_data - stat_data对象
 */
export function deduplicatePlotNodeRecords(stat_data: Record<string, any>): void {
  if (!_.has(stat_data, 'plot_record.剧情节点记录')) {
    return;
  }

  const plotNodeRecords = _.get(stat_data, 'plot_record.剧情节点记录');
  if (Array.isArray(plotNodeRecords)) {
    const originalLength = plotNodeRecords.length;
    const deduplicated = removeDuplicateTexts(plotNodeRecords);

    if (deduplicated.length !== originalLength) {
      _.set(stat_data, 'plot_record.剧情节点记录', deduplicated);
      console.log(
        `[剧情节点去重] 已去除 ${originalLength - deduplicated.length} 个重复记录，当前记录数: ${deduplicated.length}`,
      );
    }
  }
}

/**
 * 处理剧情进度变更
 * @param stat_data - stat_data对象
 * @param path - 变量路径
 * @param oldValue - 旧值
 * @param newValue - 新值
 */
export function handlePlotProgress(stat_data: Record<string, any>, path: string, oldValue: any, newValue: any): void {
  if (path === 'plot_record.剧情进度') {
    console.log(`剧情进度从 "${oldValue}" 变更为 "${newValue}"`);

    // 清空剧情节点记录
    if (_.has(stat_data, 'plot_record.剧情节点记录')) {
      _.set(stat_data, 'plot_record.剧情节点记录', []);
      console.log('已清空剧情节点记录');
    }
  }

  // 当剧情节点记录被更新时，进行去重处理
  if (path === 'plot_record.剧情节点记录') {
    deduplicatePlotNodeRecords(stat_data);
  }
}
