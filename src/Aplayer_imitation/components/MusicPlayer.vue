<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { AudioEngine } from '../core/audio-engine';
import { usePlayerStore } from '../stores/player';
import { PlayerEvent, PlayOrder } from '../types/enums';
import { formatTime } from '../utils/audio';
import { LoadingState, RetryHandler, useErrorHandler } from '../utils/error-handler';
import PlayerControls from './PlayerControls.vue';
import PlayList from './PlayList.vue';
import ProgressBar from './ProgressBar.vue';
import VolumeControl from './VolumeControl.vue';

// Store
const playerStore = usePlayerStore();
const {
  audioList,
  currentIndex,
  isPlaying,
  volume,
  order,
  isMinimized,
  listFolded,
  autoPlay,
  currentTime,
  duration,
  buffered,
  canSkipPrev,
  canSkipNext,
  isMuted,
} = storeToRefs(playerStore);

// 音频引擎
let audioEngine: AudioEngine;
let retryHandler: RetryHandler;

// 错误处理
const errorHandler = useErrorHandler();
const { handleAudioLoadError, handleAudioPlayError, setLoadingState } = errorHandler;

// 播放状态跟踪 - 关键：跟踪当前实际播放的音频URL
const currentlyLoadedTrackUrl = ref<string>('');
const isTrackChanging = ref<boolean>(false);

// 计算属性
const formattedCurrentTime = computed(() => formatTime(currentTime.value).full);
const formattedDuration = computed(() => formatTime(duration.value).full);

// 获取当前歌曲信息
const currentTrack = computed(() => playerStore.currentTrack);

const orderTitle = computed(() => {
  switch (order.value) {
    case PlayOrder.LIST:
      return '列表循环';
    case PlayOrder.RANDOM:
      return '随机播放';
    case PlayOrder.REPEAT_ONE:
      return '单曲循环';
    case PlayOrder.NONE:
      return '播完停止';
    default:
      return '列表循环';
  }
});

const orderIconClass = computed(() => {
  switch (order.value) {
    case PlayOrder.RANDOM:
      return 'fas fa-random';
    case PlayOrder.REPEAT_ONE:
      return 'fas fa-redo-alt';
    case PlayOrder.NONE:
      return 'fas fa-arrow-right';
    default:
      return 'fas fa-retweet';
  }
});

// 核心播放控制函数
const play = async () => {
  const track = playerStore.currentTrack;
  if (!track) return;

  try {
    // 只有当音频未加载或URL不匹配时才重新加载
    if (currentlyLoadedTrackUrl.value !== track.url || audioEngine.duration === 0) {
      console.log('[APlayer] 播放前检测到音频未加载，先加载音频');
      await loadCurrentTrack();
    }

    setLoadingState(LoadingState.LOADING);
    await retryHandler.execute(
      () => audioEngine.play(),
      (attempt, error) => {
        console.warn(`播放重试 ${attempt}/3:`, error);
      },
    );
    playerStore.setPlaying(true);
    setLoadingState(LoadingState.SUCCESS);
    console.log('[APlayer] 播放成功:', track.name);
  } catch (error) {
    console.error('[APlayer] 播放失败:', error);
    handleAudioPlayError(track.name, error);
    playerStore.setPlaying(false);
    setLoadingState(LoadingState.ERROR);
  }
};

const pause = () => {
  audioEngine.pause();
  playerStore.setPlaying(false);
  console.log('[APlayer] 已暂停播放');
};

const togglePlay = () => {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
};

// 加载当前音频
const loadCurrentTrack = async () => {
  const track = playerStore.currentTrack;
  if (!track) return;
  if (isTrackChanging.value) return; // 防止并发加载

  // 检查是否需要重新加载
  if (currentlyLoadedTrackUrl.value === track.url) {
    console.log('[APlayer] 音频已加载，跳过重复加载:', track.name);
    return;
  }

  isTrackChanging.value = true;
  console.log('[APlayer] 开始加载音频:', track.name, track.url);

  try {
    setLoadingState(LoadingState.LOADING);

    // 重置播放状态
    playerStore.updateTime(0);
    playerStore.updateDuration(0);
    playerStore.updateBuffered(0);

    await retryHandler.execute(
      () => audioEngine.loadTrack(track!),
      (attempt, error) => {
        console.warn(`音频加载重试 ${attempt}/3:`, track?.name, error);
      },
    );

    // 记录已加载的音频URL
    currentlyLoadedTrackUrl.value = track.url;
    setLoadingState(LoadingState.SUCCESS);
    console.log('[APlayer] 音频加载成功:', track.name);
  } catch (error) {
    console.error('[APlayer] 加载音频失败:', error);
    handleAudioLoadError(track.name, track.url, error);
    setLoadingState(LoadingState.ERROR);
    currentlyLoadedTrackUrl.value = ''; // 清除加载状态

    // 尝试播放下一首
    setTimeout(() => handleNext(), 1500);
  } finally {
    isTrackChanging.value = false;
  }
};

// 切换歌曲的统一处理函数 - 重构
const switchTrack = async (shouldAutoPlay = false) => {
  const track = playerStore.currentTrack;
  if (!track) return;

  console.log('[APlayer] 开始切换歌曲到:', track.name);

  // 先停止当前播放
  pause();

  // 强制重新加载音频（清除缓存状态）
  currentlyLoadedTrackUrl.value = '';

  // 加载新歌曲
  await loadCurrentTrack();

  // 如果需要自动播放
  if (shouldAutoPlay) {
    await play();
  }
};

const handlePrev = async () => {
  const wasPlaying = isPlaying.value;
  console.log('[APlayer] 点击上一首，当前播放状态:', wasPlaying);
  playerStore.skipToPrev();
  await switchTrack(wasPlaying);
};

const handleNext = async () => {
  const wasPlaying = isPlaying.value;
  console.log('[APlayer] 点击下一首，当前播放状态:', wasPlaying);
  playerStore.skipToNext();
  await switchTrack(wasPlaying);
};

const handleSelectTrack = async (index: number) => {
  const wasPlaying = isPlaying.value;
  console.log('[APlayer] 选择歌曲索引:', index, '当前播放状态:', wasPlaying);
  console.log('[APlayer] 选择的歌曲:', audioList.value[index]?.name);

  playerStore.switchTo(index);
  await switchTrack(wasPlaying);
};

const handleSeek = (time: number) => {
  // 确保音频已加载并且可以播放
  if (audioEngine.duration > 0) {
    audioEngine.seek(time);
  } else {
    console.warn('[APlayer] 无法快进，音频尚未加载完成');
  }
};

const handleVolumeChange = (vol: number) => {
  playerStore.setVolume(vol);
  audioEngine.setVolume(vol);
};

const handleToggleMute = () => {
  playerStore.toggleMute();
  audioEngine.setVolume(volume.value);
};

const handleToggleOrder = () => {
  const orders = [PlayOrder.LIST, PlayOrder.RANDOM, PlayOrder.REPEAT_ONE, PlayOrder.NONE];
  const currentOrderIndex = orders.indexOf(order.value);
  const nextOrder = orders[(currentOrderIndex + 1) % orders.length];
  playerStore.setOrder(nextOrder);
};

const handleToggleList = () => {
  playerStore.toggleList();
};

const handleToggleMinimized = () => {
  playerStore.toggleMinimized();
};

// 处理音频结束事件
const handleAudioEnded = async () => {
  switch (order.value) {
    case PlayOrder.REPEAT_ONE:
      // 单曲循环：重新播放当前歌曲
      audioEngine.seek(0);
      await play();
      break;
    case PlayOrder.NONE:
      // 播完停止：直接停止播放
      pause();
      break;
    case PlayOrder.RANDOM:
    case PlayOrder.LIST:
    default:
      // 随机播放和列表循环：自动播放下一首
      playerStore.skipToNext();
      await switchTrack(true);
      break;
  }
};

// 生命周期
onMounted(() => {
  audioEngine = new AudioEngine();
  retryHandler = new RetryHandler(3, 1000);

  // 绑定音频事件
  audioEngine.on(PlayerEvent.TIME_UPDATE, () => {
    playerStore.updateTime(audioEngine.currentTime);
  });

  audioEngine.on(PlayerEvent.LOADED_METADATA, () => {
    playerStore.updateDuration(audioEngine.duration);
  });

  audioEngine.on(PlayerEvent.PROGRESS, () => {
    playerStore.updateBuffered(audioEngine.buffered);
  });

  audioEngine.on(PlayerEvent.ENDED, handleAudioEnded);

  audioEngine.on(PlayerEvent.ERROR, (error: Event) => {
    console.error('[APlayer] 音频播放错误:', error);
    if (currentTrack.value) {
      handleAudioLoadError(currentTrack.value.name, currentTrack.value.url, error);
    }
    // 自动跳到下一首
    setTimeout(() => handleNext(), 1500);
  });

  // 设置初始音量
  audioEngine.setVolume(volume.value);

  // 加载第一首歌
  if (currentTrack.value) {
    loadCurrentTrack().then(() => {
      // 如果开启了自动播放，则在加载完成后自动播放
      if (autoPlay.value) {
        play();
      }
    });
  }
});

onUnmounted(() => {
  if (audioEngine) {
    audioEngine.destroy();
  }
});

// 监听当前歌曲变化
watch(
  currentIndex,
  async (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && audioEngine) {
      // 清除当前加载状态，强制重新加载
      currentlyLoadedTrackUrl.value = '';
      await loadCurrentTrack();
    }
  },
  { immediate: false },
);

// 监听音量变化
watch(volume, newVolume => {
  if (audioEngine) {
    audioEngine.setVolume(newVolume);
  }
});
</script>

<template>
  <div class="aplayer" :class="{ 'aplayer-narrow': isMinimized }">
    <!-- 播放列表 -->
    <PlayList
      :tracks="audioList"
      :current-index="currentIndex"
      :is-visible="!listFolded"
      @select-track="handleSelectTrack"
    />

    <div class="aplayer-body">
      <!-- 封面和播放按钮 -->
      <div class="aplayer-pic" :class="{ 'aplayer-pic-playing': isPlaying }" @click="togglePlay">
        <div class="aplayer-button" :class="{ 'aplayer-button-playing': isPlaying }">
          <i class="fas fa-play" v-show="!isPlaying"></i>
          <i class="fas fa-pause" v-show="isPlaying"></i>
        </div>
        <img class="aplayer-pic-img" :src="currentTrack?.cover" :alt="currentTrack?.name || '封面'" />
      </div>

      <!-- 播放信息和控制 -->
      <div class="aplayer-info">
        <div class="aplayer-info-top">
          <!-- 歌曲信息 -->
          <div class="aplayer-music">
            <span class="aplayer-title">{{ currentTrack?.name || '未知歌曲' }}</span>
            <span class="aplayer-author"> - {{ currentTrack?.artist || '未知艺术家' }}</span>
          </div>

          <!-- 控制按钮 -->
          <PlayerControls
            :is-playing="isPlaying"
            :can-skip-prev="canSkipPrev"
            :can-skip-next="canSkipNext"
            @play="play"
            @pause="pause"
            @prev="handlePrev"
            @next="handleNext"
            @toggle-list="handleToggleList"
          />
        </div>

        <div class="aplayer-controller">
          <!-- 进度条 -->
          <ProgressBar :current-time="currentTime" :duration="duration" :buffered="buffered" @seek="handleSeek" />

          <!-- 时间和音量 -->
          <div class="aplayer-time">
            <span class="aplayer-time-inner">
              <span class="aplayer-ptime">{{ formattedCurrentTime }}</span> /
              <span class="aplayer-dtime">{{ formattedDuration }}</span>
            </span>

            <VolumeControl
              :volume="volume"
              :is-muted="isMuted"
              @volume-change="handleVolumeChange"
              @toggle-mute="handleToggleMute"
            />

            <button class="aplayer-order" :title="orderTitle" @click="handleToggleOrder">
              <i :class="orderIconClass"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 收缩/展开按钮 -->
      <div class="aplayer-miniswitcher">
        <button class="aplayer-icon" @click="handleToggleMinimized">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32">
            <path d="M22 16l-10.105-10.6-1.895 1.987 8.211 8.613-8.211 8.612 1.895 1.988 8.211-8.613z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.aplayer {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 9999;
  background: #fff;
  border-radius: 0;
  box-shadow:
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  font-size: 12px;
  line-height: normal;
  max-width: 400px;
  min-width: 300px;
  transition: all 0.3s ease;

  &.aplayer-narrow {
    width: 18px;
    min-width: 18px;
    transform: translateX(-20%);

    .aplayer-info {
      display: none;
    }

    .aplayer-miniswitcher {
      .aplayer-icon {
        transform: rotate(0);
      }
    }
  }
}

.aplayer-body {
  display: flex;
  position: relative;
  overflow: hidden;
  height: 66px;
  padding-right: 18px;
}

.aplayer-pic {
  position: relative;
  width: 66px;
  height: 66px;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;

  .aplayer-pic-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .aplayer-button {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    cursor: pointer;
    color: #fff;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);

    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    background: rgba(0, 0, 0, 0.2);
    font-size: 16px;
    transition: all 0.2s ease-out;

    &:hover {
      border-color: rgba(255, 255, 255, 1);
    }

    &.aplayer-button-playing {
      top: auto;
      left: auto;
      bottom: 6px;
      right: 6px;
      transform: none;
      width: 20px;
      height: 20px;
      background: transparent;
      font-size: 10px;
    }

    .fa-play {
      text-align: center;
      height: 15px;
      width: 8px;
      font-size: 14px;
    }

    .fa-pause {
      text-align: center;
      height: 10px;
      width: 12px;
    }
  }
}

.aplayer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 8px 15px 10px 15px;
  justify-content: space-between;
  border-top: 1px solid #e9e9e9;
}

.aplayer-info-top {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.aplayer-music {
  flex: 1;
  overflow: hidden;
  margin-right: 15px;
  min-width: 0;

  .aplayer-title {
    font-size: 14px;
    font-weight: 400;
    color: #212121;
    margin: 0 0 2px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.1;
  }

  .aplayer-author {
    font-size: 12px;
    color: #666;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.1;
  }
}

.aplayer-controller {
  display: flex;
  align-items: center;
  width: 100%;
}

.aplayer-time {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 11px;
  flex-shrink: 0;
  white-space: nowrap;

  .aplayer-time-inner {
    margin-right: 7px;
    font-variant-numeric: tabular-nums;
  }

  .aplayer-ptime,
  .aplayer-dtime {
    font-variant-numeric: tabular-nums;
  }
}

.aplayer-order {
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: #999;
  font-size: 11px;
  padding: 0;
  transition: all 0.2s ease;
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 1px;

  &:hover {
    color: #b7daff;
  }
}

.aplayer-miniswitcher {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  background: #e6e6e6;
  width: 18px;
  border-radius: 0 2px 2px 0;

  .aplayer-icon {
    height: 100%;
    width: 100%;
    transform: rotate(180deg);
    transition: all 0.3s ease;
    border: none;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    opacity: 0.8;
    vertical-align: middle;
    padding: 0;
    font-size: 12px;
    margin: 0;
    display: inline-block;

    svg {
      width: 12px;
      height: 12px;
      fill: #666;
    }
  }
}

// 移动端适配 - 标准响应式断点
@media screen and (max-width: 1024px) {
  .aplayer {
    max-width: calc(100vw - 40px);
  }
}

@media screen and (max-width: 768px) {
  .aplayer {
    bottom: 80% !important;
    max-width: calc(100vw - 20px);
    min-width: auto;

    &.aplayer-narrow {
      bottom: 80% !important;
    }
  }
}

// 平板端调整
@media screen and (max-width: 640px) {
  .aplayer-body {
    height: 58px;
  }

  .aplayer-pic {
    width: 58px;
    height: 58px;
  }

  .aplayer-info {
    padding: 7px 12px 9px 12px;
  }
}

// 移动端
@media screen and (max-width: 480px) {
  .aplayer-body {
    height: 54px;
  }

  .aplayer-pic {
    .aplayer-author {
      font-size: 11px;
    }
  }

  .aplayer-time {
    .aplayer-time-inner {
      margin-right: 5px;
    }
  }

  .aplayer-order {
    width: 13px;
    height: 13px;
    font-size: 10px;
  }
}

// 小屏移动端
@media screen and (max-width: 390px) {
  .aplayer-body {
    height: 50px;
  }

  .aplayer-pic {
    width: 50px;
    height: 50px;
  }

  .aplayer-info {
    padding: 4px 10px 6px 10px;
  }

  .aplayer-music {
    .aplayer-title {
      font-size: 12px;
    }

    .aplayer-author {
      font-size: 10px;
    }
  }
}

// 极小屏幕
@media screen and (max-width: 320px) {
  .aplayer-body {
    height: 46px;
  }

  .aplayer-pic {
    width: 46px;
    height: 46px;
  }

  .aplayer-info {
    padding: 3px 8px 5px 8px;
  }

  .aplayer-order {
    display: none;
  }
}
</style>
