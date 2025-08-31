import type { ValueConstraintsConfig } from '../types/index';
import { createNumberConstraint } from '../utils/number-utils';

/**
 * 数值验证约束函数
 */
export const VALUE_CONSTRAINTS: ValueConstraintsConfig = {
  // 主要角色数值限制
  "主要角色.白.关注度": createNumberConstraint(0, 1),
  "主要角色.澪.好感度": createNumberConstraint(-1, 1),
  "主要角色.澪.治愈进度": createNumberConstraint(0, 90, true),

  // 模式匹配约束
  pattern_信任值: createNumberConstraint(-1, 1),
  pattern_好感度: createNumberConstraint(-1, 1),
  pattern_依赖度: createNumberConstraint(-1, 1),
  pattern_认可度: createNumberConstraint(-1, 1),
  pattern_污秽侵蚀度: createNumberConstraint(0, 1),
  pattern_模因侵蚀率: createNumberConstraint(0, 1),
};