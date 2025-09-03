/**
 * 常量类型声明
 */

/**
 * 内部存储键名类型
 */
export interface InternalKeys {
  /** 上一次 次要角色 状态存储键名 */
  readonly PREVIOUS_SECONDARY_CHARACTERS_KEY: string;
}

/**
 * 允许的次要角色列表类型
 */
export type AllowedSecondaryCharacters = readonly string[];
