import type { AudioTrack, FormattedTime } from '../types';
import { PlayerEvent } from '../types/enums';
import { formatTime } from '../utils/audio';

/**
 * 音频播放引擎核心类
 */
export class AudioEngine {
  private readonly audio: HTMLAudioElement;
  private readonly eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.bindAudioEvents();
  }

  /**
   * 绑定音频元素事件
   */
  private bindAudioEvents(): void {
    const events: (keyof HTMLMediaElementEventMap)[] = [
      'play',
      'pause',
      'ended',
      'timeupdate',
      'loadedmetadata',
      'canplay',
      'progress',
      'error'
    ];

    events.forEach(event => {
      this.audio.addEventListener(event, (e) => {
        this.emit(event as PlayerEvent, e);
      });
    });
  }

  /**
   * 事件监听
   */
  on(event: PlayerEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event: PlayerEvent, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: PlayerEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * 加载音频
   */
  async loadTrack(track: AudioTrack): Promise<void> {
    return new Promise((resolve, reject) => {
      // 停止当前播放
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.removeAttribute('src');
      this.audio.load();

      // 设置新音频源
      this.audio.src = track.url;

      const onCanPlay = () => {
        this.audio.removeEventListener('canplay', onCanPlay);
        this.audio.removeEventListener('error', onError);
        resolve();
      };

      const onError = (_e: Event) => {
        this.audio.removeEventListener('canplay', onCanPlay);
        this.audio.removeEventListener('error', onError);
        reject(new Error(`音频加载失败: ${track.name}`));
      };

      this.audio.addEventListener('canplay', onCanPlay, { once: true });
      this.audio.addEventListener('error', onError, { once: true });
    });
  }

  /**
   * 播放
   */
  async play(): Promise<void> {
    if (this.audio.readyState >= 2) { // HAVE_CURRENT_DATA
      try {
        await this.audio.play();
      } catch (error) {
        console.error('播放失败:', error);
        throw error;
      }
    } else {
      // 等待音频加载
      return new Promise((resolve, reject) => {
        const onCanPlay = async () => {
          this.audio.removeEventListener('canplay', onCanPlay);
          try {
            await this.audio.play();
            resolve();
          } catch (error) {
            reject(new Error(`播放失败: ${error}`));
          }
        };
        this.audio.addEventListener('canplay', onCanPlay, { once: true });
      });
    }
  }

  /**
   * 暂停
   */
  pause(): void {
    this.audio.pause();
  }

  /**
   * 跳转到指定时间
   */
  seek(time: number): void {
    this.audio.currentTime = time;
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 获取当前播放时间
   */
  get currentTime(): number {
    return this.audio.currentTime || 0;
  }

  /**
   * 获取音频总时长
   */
  get duration(): number {
    return this.audio.duration || 0;
  }

  /**
   * 获取缓冲进度
   */
  get buffered(): number {
    const buffered = this.audio.buffered;
    if (buffered.length > 0) {
      return buffered.end(buffered.length - 1);
    }
    return 0;
  }

  /**
   * 获取当前音量
   */
  get volume(): number {
    return this.audio.volume;
  }

  /**
   * 是否暂停
   */
  get paused(): boolean {
    return this.audio.paused;
  }

  /**
   * 是否结束
   */
  get ended(): boolean {
    return this.audio.ended;
  }

  /**
   * 获取格式化的当前时间
   */
  get formattedCurrentTime(): FormattedTime {
    return formatTime(this.currentTime);
  }

  /**
   * 获取格式化的总时长
   */
  get formattedDuration(): FormattedTime {
    return formatTime(this.duration);
  }

  /**
   * 销毁音频引擎
   */
  destroy(): void {
    this.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.eventListeners.clear();
  }
}