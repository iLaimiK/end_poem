/**
 * Zod Schema 工具函数和工厂函数
 */

// 基础 Transform 工具函数

/** 数组去重 transform */
export const uniqueArray = <T>(arr: T[]): T[] => _.uniq(arr);

/** 数组去重并强制包含特定值 */
export const uniqueArrayWith =
  <T>(required: T[]) =>
  (arr: T[]): T[] =>
    _.uniq([...arr, ...required]);

/** 数值范围限制 transform */
export const clamp = (min: number, max: number) => (val: number) => _.clamp(val, min, max);

/** 锁定值 transform（无论输入什么都返回固定值） */
export const locked =
  <T>(value: T) =>
  () =>
    value;

// Schema 工厂函数

/**
 * 物品对象 schema
 */
export const itemSchema = z.object({
  desc: z.string(),
  type: z.string(),
  quantity: z.coerce.number(),
});

/**
 * 锁定物品 schema（值不可变，无论输入什么都返回默认值）
 */
export const lockedItem = (defaultDesc: string, defaultType: string, defaultQuantity = 1) =>
  z
    .object({
      desc: z.string().prefault(defaultDesc).transform(locked(defaultDesc)),
      type: z.string().prefault(defaultType).transform(locked(defaultType)),
      quantity: z.coerce.number().prefault(defaultQuantity).transform(locked(defaultQuantity)),
    })
    .prefault({});

/**
 * 锁定字符串 schema（值不可变）
 */
export const lockedStr = (value: string) => z.string().prefault(value).transform(locked(value));

/**
 * 外观记录 schema
 */
export const appearance = (defaults: Record<string, string> = {}) =>
  z.record(z.string(), z.string()).prefault(defaults);

/**
 * 唯一字符串数组 schema（带去重）
 */
export const uniqueStrArray = (defaults: string[] = []) =>
  z.array(z.string()).prefault(defaults).transform(uniqueArray);

/**
 * 唯一字符串数组 schema（带去重和强制包含值）
 */
export const uniqueStrArrayWith = (defaults: string[], required: string[]) =>
  z.array(z.string()).prefault(defaults).transform(uniqueArrayWith(required));

/**
 * 范围限制数值 schema
 */
export const clampedNum = (defaultVal: number, min: number, max: number) =>
  z.coerce.number().prefault(defaultVal).transform(clamp(min, max));

/**
 * 灵魂对象 schema
 */
export const soulSchema = z.object({
  desc: z.string(),
  灵魂能力: z.record(z.string(), z.string()).prefault({}),
});
