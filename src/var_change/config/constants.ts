import type { InternalKeys } from '../types/constants';

/**
 * 内部常量定义
 */
export const INTERNAL_KEYS: InternalKeys = {
  /** 次要角色状态存储键名（存储在stat_data中以确保持久性） */
  PREVIOUS_SECONDARY_CHARACTERS_KEY: "_internal.previousSecondaryCharacters"
} as const;