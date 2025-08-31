/**
 * 播放器相关类型定义
 */
import type { AudioTrack } from './audio';
import { PlayOrder } from './enums';

/** 播放器配置选项 */
export interface PlayerOptions {
  /** 挂载容器选择器 */
  container: string;
  /** 音频列表 */
  audio?: AudioTrack[];
  /** 默认音量 (0-1) */
  volume?: number;
  /** 循环模式 */
  loop?: string;
  /** 播放顺序 */
  order?: PlayOrder;
  /** 主题色 */
  theme?: string;
  /** 播放列表是否折叠 */
  listFolded?: boolean;
  /** 播放列表最大高度 */
  listMaxHeight?: number;
}

/** 播放器状态接口 */
export interface PlayerState {
  /** 当前播放索引 */
  currentIndex: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前音量 */
  volume: number;
  /** 上一次音量（用于静音切换） */
  previousVolume: number;
  /** 播放模式 */
  order: PlayOrder;
  /** 是否最小化 */
  isMinimized: boolean;
  /** 播放列表是否折叠 */
  listFolded: boolean;
  /** 当前播放时间 */
  currentTime: number;
  /** 音频总时长 */
  duration: number;
  /** 缓冲进度 */
  buffered: number;
}
