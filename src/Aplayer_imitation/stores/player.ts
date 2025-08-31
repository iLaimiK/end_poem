import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { DEFAULT_AUDIOS } from '../data/default-audios';
import type { AudioTrack, PlayerState } from '../types';
import { PlayOrder } from '../types/enums';
import { getRandomIndex } from '../utils/audio';

export const usePlayerStore = defineStore('player', () => {
  // 基础状态
  const audioList = ref<AudioTrack[]>([...DEFAULT_AUDIOS]);
  const currentIndex = ref<number>(0);
  const isPlaying = ref<boolean>(false);
  const volume = ref<number>(0.7);
  const previousVolume = ref<number>(0.7);
  const order = ref<PlayOrder>(PlayOrder.LIST);
  const isMinimized = ref<boolean>(false);
  const listFolded = ref<boolean>(true);
  const autoPlay = ref<boolean>(false);

  // 播放进度状态
  const currentTime = ref<number>(0);
  const duration = ref<number>(0);
  const buffered = ref<number>(0);


  // 计算属性
  const currentTrack = computed(() => {
    return audioList.value[currentIndex.value] || null;
  });

  const canSkipPrev = computed(() => {
    return audioList.value.length > 1;
  });

  const canSkipNext = computed(() => {
    return audioList.value.length > 1;
  });

  const progress = computed(() => {
    if (!duration.value) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const bufferedProgress = computed(() => {
    if (!duration.value) return 0;
    return (buffered.value / duration.value) * 100;
  });

  const isMuted = computed(() => {
    return volume.value === 0;
  });

  // 获取完整状态
  const playerState = computed((): PlayerState => ({
    currentIndex: currentIndex.value,
    isPlaying: isPlaying.value,
    volume: volume.value,
    previousVolume: previousVolume.value,
    order: order.value,
    isMinimized: isMinimized.value,
    listFolded: listFolded.value,
    currentTime: currentTime.value,
    duration: duration.value,
    buffered: buffered.value,
  }));

  // Actions
  const setAudioList = (tracks: AudioTrack[]) => {
    audioList.value = [...tracks];
    if (currentIndex.value >= tracks.length) {
      currentIndex.value = 0;
    }
  };

  const setCurrentIndex = (index: number) => {
    if (index >= 0 && index < audioList.value.length) {
      currentIndex.value = index;
    }
  };

  const setPlaying = (playing: boolean) => {
    isPlaying.value = playing;
  };

  const setVolume = (vol: number) => {
    const newVolume = Math.max(0, Math.min(1, vol));
    if (volume.value > 0) {
      previousVolume.value = volume.value;
    }
    volume.value = newVolume;
  };

  const toggleMute = () => {
    if (volume.value > 0) {
      setVolume(0);
    } else {
      setVolume(previousVolume.value > 0 ? previousVolume.value : 1);
    }
  };

  const setOrder = (newOrder: PlayOrder) => {
    order.value = newOrder;
  };

  const toggleMinimized = () => {
    isMinimized.value = !isMinimized.value;
  };

  const toggleList = () => {
    listFolded.value = !listFolded.value;
  };

  const updateTime = (time: number) => {
    currentTime.value = time;
  };

  const updateDuration = (dur: number) => {
    duration.value = dur;
  };

  const updateBuffered = (buf: number) => {
    buffered.value = buf;
  };

  const getNextIndex = (): number => {
    switch (order.value) {
      case PlayOrder.RANDOM:
        return getRandomIndex(audioList.value.length, currentIndex.value);
      case PlayOrder.REPEAT_ONE:
        return currentIndex.value;
      case PlayOrder.NONE:
        return currentIndex.value >= audioList.value.length - 1
          ? currentIndex.value
          : currentIndex.value + 1;
      case PlayOrder.LIST:
      default:
        return (currentIndex.value + 1) % audioList.value.length;
    }
  };

  const getPrevIndex = (): number => {
    switch (order.value) {
      case PlayOrder.RANDOM:
        return getRandomIndex(audioList.value.length, currentIndex.value);
      case PlayOrder.REPEAT_ONE:
        return currentIndex.value;
      case PlayOrder.NONE:
        return currentIndex.value <= 0
          ? currentIndex.value
          : currentIndex.value - 1;
      case PlayOrder.LIST:
      default:
        return currentIndex.value === 0
          ? audioList.value.length - 1
          : currentIndex.value - 1;
    }
  };

  const skipToNext = () => {
    const nextIndex = getNextIndex();
    if (order.value === PlayOrder.NONE && nextIndex === currentIndex.value) {
      // 播完停止模式下到达末尾，停止播放
      setPlaying(false);
      return;
    }
    setCurrentIndex(nextIndex);
  };

  const skipToPrev = () => {
    const prevIndex = getPrevIndex();
    if (order.value === PlayOrder.NONE && prevIndex === currentIndex.value) {
      // 播完停止模式下到达开头，停止播放
      setPlaying(false);
      return;
    }
    setCurrentIndex(prevIndex);
  };

  const switchTo = (index: number) => {
    setCurrentIndex(index);
  };

  // 重置播放器
  const reset = () => {
    setPlaying(false);
    updateTime(0);
    updateDuration(0);
    updateBuffered(0);
  };

  // 从脚本变量初始化设置
  const initFromSettings = (settings: any) => {
    if (settings.defaultVolume !== undefined) {
      volume.value = settings.defaultVolume;
      previousVolume.value = settings.defaultVolume;
    }
    if (settings.defaultOrder !== undefined) {
      order.value = settings.defaultOrder;
    }
    if (settings.listFolded !== undefined) {
      listFolded.value = settings.listFolded;
    }
    if (settings.isMinimized !== undefined) {
      isMinimized.value = settings.isMinimized;
    }
    if (settings.autoPlay !== undefined) {
      autoPlay.value = settings.autoPlay;
    }
    // 加载自定义歌曲列表
    if (settings.customAudioList && Array.isArray(settings.customAudioList) && settings.customAudioList.length > 0) {
      audioList.value = [...settings.customAudioList];
      // 重置当前索引防止越界
      if (currentIndex.value >= settings.customAudioList.length) {
        currentIndex.value = 0;
      }
    }
  };

  // 保存当前设置到脚本变量
  const saveCurrentSettings = () => {
    const currentSettings = {
      defaultVolume: volume.value,
      defaultOrder: order.value,
      autoPlay: autoPlay.value,
      listFolded: listFolded.value,
      isMinimized: isMinimized.value,
      customAudioList: audioList.value,
    };

    try {
      replaceVariables(currentSettings, {
        type: 'script',
        script_id: getScriptId()
      });
    } catch (error) {
      console.warn('[APlayer] 保存设置失败:', error);
    }
  };

  return {
    // 状态
    audioList,
    currentIndex,
    isPlaying,
    volume,
    previousVolume,
    order,
    isMinimized,
    listFolded,
    autoPlay,
    currentTime,
    duration,
    buffered,

    // 计算属性
    currentTrack,
    canSkipPrev,
    canSkipNext,
    progress,
    bufferedProgress,
    isMuted,
    playerState,

    // Actions
    setAudioList,
    setCurrentIndex,
    setPlaying,
    setVolume,
    toggleMute,
    setOrder,
    toggleMinimized,
    toggleList,
    updateTime,
    updateDuration,
    updateBuffered,
    getNextIndex,
    getPrevIndex,
    skipToNext,
    skipToPrev,
    switchTo,
    reset,

    // 设置管理方法
    initFromSettings,
    saveCurrentSettings,
  };
});