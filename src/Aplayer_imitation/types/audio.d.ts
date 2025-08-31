/**
 * 音频相关类型定义
 */

/** 音频数据接口定义 */
export interface AudioTrack {
  /** 歌曲名称 */
  name: string;
  /** 艺术家名称 */
  artist: string;
  /** 音频文件 URL */
  url: string;
  /** 封面图片 URL */
  cover: string;
}


/** 时间格式化结果 */
export interface FormattedTime {
  /** 分钟 */
  minutes: string;
  /** 秒钟 */
  seconds: string;
  /** 完整时间字符串 MM:SS */
  full: string;
}