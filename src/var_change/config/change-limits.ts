import type { ChangeLimitsConfig } from '../types/index';

/**
 * 数值变化限制配置
 */
export const CHANGE_LIMITS: ChangeLimitsConfig = {
  // 主要角色变化限制
  '主要角色.白.关注度': {
    minChange: -0.014,
    maxChange: 0.026,
  },
  '主要角色.澪.好感度': {
    minChange: -0.05,
    maxChange: 0.08,
  },
  '主要角色.澪.治愈进度': {
    minChange: -5,
    maxChange: Number.POSITIVE_INFINITY, // 正向变化不限制
  },

  // 模式匹配变化限制
  pattern_信任值: { minChange: -0.15, maxChange: 0.2 },
  pattern_好感度: { minChange: -0.05, maxChange: 0.08 },
  pattern_依赖度: { minChange: -0.05, maxChange: 0.08 },
  pattern_认可度: { minChange: -0.05, maxChange: 0.08 },
  pattern_污秽侵蚀度: {
    minChange: -0.05,
    maxChange: 0.1,
  },
  pattern_模因侵蚀率: {
    minChange: -0.3,
    maxChange: 0.05,
  },
};
