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

/** 物品对象类型 */
export type ItemSchema = z.infer<typeof itemSchema>;

/**
 * 带默认值恢复的数量 schema
 * 当 quantity 为 0 时自动恢复到默认值，而不是被删除
 * @param defaultVal - 默认数量值
 * @example
 * quantity: quantityWithDefault(2) // 当输入为 0 时恢复为 2
 */
export const quantityWithDefault = (defaultVal: number) =>
  z.coerce
    .number()
    .prefault(defaultVal)
    .transform(val => (val <= 0 ? defaultVal : val));

/**
 * 过滤掉 quantity 为 0 的物品 transform 函数
 * 用于物品容器的后处理，移除数量为 0 的物品
 * 注意：固定物品数量应使用 quantityWithDefault 来在 0 时恢复默认值，这样不会被此函数删除
 * @example
 * z.object({ ... }).catchall(itemSchema).prefault({}).transform(filterZeroQuantityItems)
 */
export const filterZeroQuantityItems = <T extends Record<string, unknown>>(items: T): T => {
  const result = {} as T;
  for (const key in items) {
    const item = items[key];
    // 检查 item 是否为对象且包含 quantity 属性
    if (item && typeof item === 'object' && 'quantity' in item) {
      const quantity = (item as { quantity?: number }).quantity;
      // 保留 quantity 不存在、undefined 或大于 0 的物品
      if (quantity === undefined || quantity > 0) {
        result[key] = item;
      }
    } else {
      // 非物品对象直接保留
      result[key] = item;
    }
  }
  return result;
};

/**
 * 锁定字符串 schema（值不可变）
 */
export const lockedStr = (value: string) => z.string().prefault(value).transform(locked(value));

/**
 * 锁定物品 schema（值不可变，无论输入什么都返回默认值）
 */
export const lockedItem = (defaultDesc: string, defaultType: string, defaultQuantity = 1) =>
  z
    .object({
      desc: lockedStr(defaultDesc),
      type: lockedStr(defaultType),
      quantity: z.coerce.number().prefault(defaultQuantity).transform(locked(defaultQuantity)),
    })
    .prefault({});

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
