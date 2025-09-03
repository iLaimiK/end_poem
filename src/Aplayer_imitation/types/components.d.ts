/**
 * Vue 组件相关类型定义
 */
import type { AudioTrack } from './audio';

/** 播放控制组件 Props */
export interface PlayerControlsProps {
  isPlaying: boolean;
  canSkipPrev: boolean;
  canSkipNext: boolean;
}

/** 进度条组件 Props */
export interface ProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
}

/** 音量控制组件 Props */
export interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
}

/** 播放列表组件 Props */
export interface PlayListProps {
  tracks: AudioTrack[];
  currentIndex: number;
  isVisible: boolean;
}

/** 播放器设置组件 Props */
export interface PlayerSettingsProps {
  settings: PlayerSettings;
}

/** 播放器设置 Schema（用于 zod 验证） */
export interface PlayerSettings {
  /** 默认音量 */
  defaultVolume: number;
  /** 默认播放模式 */
  defaultOrder: string;
  /** 主题颜色 */
  themeColor: string;
  /** 是否自动播放 */
  autoPlay: boolean;
  /** 播放列表最大高度 */
  listMaxHeight: number;
}
