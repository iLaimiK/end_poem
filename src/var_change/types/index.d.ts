/**
 * MVU 变量变化处理相关类型声明
 */

/**
 * 变化限制配置
 */
export interface ChangeLimitConfig {
  /** 最小变化值 */
  minChange: number;
  /** 最大变化值 */
  maxChange: number;
}

/**
 * 变化限制配置集合
 */
export interface ChangeLimitsConfig {
  [key: string]: ChangeLimitConfig;
}

/**
 * 当前时间和位置信息
 */
export interface CurrentTimeAndLocation {
  /** 时间 */
  时间: string;
  /** 地点 */
  地点: string;
  /** 日期 */
  日期: string;
}

/**
 * 角色记录信息
 */
export interface CharacterRecord {
  /** 出场次数 */
  出场次数: number;
  /** 出场地点 */
  出场地点: string;
  /** 出场时间 */
  出场时间: string;
  /** 离场地点 */
  离场地点: string;
  /** 离场时间 */
  离场时间: string;
  /** 信任值 */
  信任值: number;
  /** 离场时持有的物品 */
  离场时持有的物品: Record<string, any>;
}

/**
 * 待验证的变量更新信息
 */
export interface PendingValidation {
  /** 统计数据对象 */
  stat_data: Record<string, any>;
  /** 变量路径 */
  path: string;
  /** 旧值 */
  oldValue: any;
  /** 新值 */
  newValue: any;
}

/**
 * MVU 事件处理函数参数类型
 */
export interface MVUEventParams {
  /** 变量对象 */
  variables?: Record<string, any>;
  /** 统计数据 */
  stat_data?: Record<string, any>;
  /** 变量路径 */
  path?: string;
  /** 旧值 */
  oldValue?: any;
  /** 新值 */
  newValue?: any;
}
