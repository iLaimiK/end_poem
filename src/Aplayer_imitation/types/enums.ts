/**
 * 枚举定义 - 包含运行时值
 */

/** 播放模式枚举 */
export enum PlayOrder {
  /** 列表循环 */
  LIST = 'list',
  /** 随机播放 */
  RANDOM = 'random',
  /** 单曲循环 */
  REPEAT_ONE = 'repeat-one',
  /** 播完停止 */
  NONE = 'none',
}

/** 播放器事件类型 */
export enum PlayerEvent {
  PLAY = 'play',
  PAUSE = 'pause',
  ENDED = 'ended',
  TIME_UPDATE = 'timeupdate',
  LOADED_METADATA = 'loadedmetadata',
  CAN_PLAY = 'canplay',
  PROGRESS = 'progress',
  ERROR = 'error',
}

/** 音频加载状态 */
export enum AudioLoadState {
  /** 未加载 */
  UNLOADED = 'unloaded',
  /** 加载中 */
  LOADING = 'loading',
  /** 已加载 */
  LOADED = 'loaded',
  /** 加载错误 */
  ERROR = 'error',
}
