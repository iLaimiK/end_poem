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
}
