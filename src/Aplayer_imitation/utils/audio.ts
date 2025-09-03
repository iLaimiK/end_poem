import type { FormattedTime } from '../types';

/**
 * 格式化时间为 MM:SS 格式
 */
export const formatTime = _.memoize((seconds: number): FormattedTime => {
  if (!seconds || isNaN(seconds)) {
    return {
      minutes: '00',
      seconds: '00',
      full: '00:00',
    };
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const minutes = mins.toString().padStart(2, '0');
  const secondsStr = secs.toString().padStart(2, '0');

  return {
    minutes,
    seconds: secondsStr,
    full: `${minutes}:${secondsStr}`,
  };
});

/**
 * 计算进度百分比 - 使用纯函数和边界检查
 */
export const calculateProgress = (current: number, total: number): number => {
  if (!total || isNaN(total) || current < 0 || isNaN(current)) {
    return 0;
  }
  return _.clamp((current / total) * 100, 0, 100);
};

/**
 * 生成随机索引（排除当前索引）- 优化算法
 */
export const getRandomIndex = (length: number, excludeIndex?: number): number => {
  if (length <= 1) return 0;

  // 使用 lodash 的随机数生成，更安全
  const availableIndices = _.range(length).filter(index => index !== excludeIndex);
  return _.sample(availableIndices) ?? 0;
};

/**
 * 音频时长验证 - 新增工具函数
 */
export const isValidDuration = (duration: number): boolean => {
  return _.isFinite(duration) && duration > 0;
};

/**
 * 安全的音频时间转换 - 新增工具函数
 */
export const safeTimeConversion = (time: unknown): number => {
  const numTime = _.toNumber(time);
  return _.isFinite(numTime) && numTime >= 0 ? numTime : 0;
};
