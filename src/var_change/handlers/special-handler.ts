/**
 * 处理澪的星尘稳定剂注入相关逻辑
 * @param stat_data - stat_data对象
 * @param path - 变量路径
 * @param newValue - 新值
 */
export function handleMioStabilizer(stat_data: Record<string, any>, path: string, newValue: any): void {
  // 检查澪是否注入星尘稳定剂
  if (path === "主要角色.澪.注入星尘稳定剂" && newValue === 1) {
    console.log(`澪.注入星尘稳定剂 的值变为 1，设置治愈进度为 90`);

    // 将治愈进度设置为 90（这是直接设置，不受变化幅度限制）
    if (_.has(stat_data, "主要角色.澪.治愈进度")) {
      _.set(stat_data, "主要角色.澪.治愈进度", 90);
      console.log("澪的治愈进度已设置为 90");
    }
  }

  // 防止治愈进度在已注入星尘稳定剂的情况下被修改
  if (
    path === "主要角色.澪.治愈进度" &&
    _.get(stat_data, "主要角色.澪.注入星尘稳定剂") === 1
  ) {
    console.log(`澪已注入星尘稳定剂，治愈进度不得修改，恢复为 90`);
    _.set(stat_data, "主要角色.澪.治愈进度", 90);
  }
}