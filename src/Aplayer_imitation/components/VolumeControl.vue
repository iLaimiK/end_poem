<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  volume: number;
  isMuted: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'volume-change': [volume: number];
  'toggle-mute': [];
}>();

const volumeBarRef = ref<HTMLElement>();
const isDragging = ref(false);

const volumePercent = computed(() => props.volume * 100);

const volumeIconClass = computed(() => {
  if (props.isMuted || props.volume === 0) {
    return 'fas fa-volume-off';
  } else if (props.volume > 0.5) {
    return 'fas fa-volume-up';
  } else {
    return 'fas fa-volume-down';
  }
});

const calculateVolumeFromEvent = (event: MouseEvent) => {
  if (!volumeBarRef.value) return;

  const rect = volumeBarRef.value.getBoundingClientRect();
  const barHeight = rect.height - 10; // 减去 padding
  const offsetY = event.clientY - rect.top - 5; // 减去上 padding

  // 改进边界处理逻辑
  let percentage: number;
  if (offsetY <= 0) {
    // 鼠标在顶部或以上，设为100%
    percentage = 1;
  } else if (offsetY >= barHeight) {
    // 鼠标在底部或以下，设为0%
    percentage = 0;
  } else {
    // 正常范围内的计算
    percentage = 1 - offsetY / barHeight;
  }

  const newVolume = Math.max(0, Math.min(1, percentage));
  emit('volume-change', newVolume);
};

const handleVolumeBarClick = (event: MouseEvent) => {
  // 如果刚刚完成拖动，不处理点击
  if (isDragging.value) return;

  event.stopPropagation();
  calculateVolumeFromEvent(event);
};

const handleMouseDown = (event: MouseEvent) => {
  if (!volumeBarRef.value) return;

  event.preventDefault();
  event.stopPropagation();

  isDragging.value = true;
  calculateVolumeFromEvent(event);

  const handleMouseMove = (e: JQuery.MouseMoveEvent) => {
    if (!isDragging.value) return;

    const mouseEvent = e.originalEvent as MouseEvent;
    calculateVolumeFromEvent(mouseEvent);
  };

  const handleMouseUp = () => {
    isDragging.value = false;

    $(document).off('mousemove.volumeControl mouseup.volumeControl');

    // 延迟重置，避免立即触发click事件
    setTimeout(() => {
      isDragging.value = false;
    }, 10);
  };

  $(document).on('mousemove.volumeControl', handleMouseMove);
  $(document).on('mouseup.volumeControl', handleMouseUp);
};
</script>

<template>
  <span class="aplayer-volume-wrap">
    <button class="aplayer-volume-button" @click="$emit('toggle-mute')">
      <i :class="volumeIconClass"></i>
    </button>
    <div class="aplayer-volume-bar-wrap">
      <div class="aplayer-volume-bar" ref="volumeBarRef" @mousedown="handleMouseDown" @click="handleVolumeBarClick">
        <div class="aplayer-volume" :style="{ height: `${volumePercent}%` }"></div>
      </div>
    </div>
  </span>
</template>

<style lang="scss" scoped>
.aplayer-volume-wrap {
  position: relative;
  display: inline-block;
  margin-right: 7px;
}

.aplayer-volume-button {
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

  &:hover {
    color: #b7daff;
  }
}

.aplayer-volume-bar-wrap {
  position: absolute;
  bottom: 15px;
  right: -3px;
  width: 25px;
  height: 36px;
  z-index: 99;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease-in-out;
}

.aplayer-volume-wrap:hover .aplayer-volume-bar-wrap {
  opacity: 1;
  visibility: visible;
}

.aplayer-volume-bar {
  position: relative;
  width: 5px;
  height: 100%;
  background: #aaa;
  cursor: pointer;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 2px;
  user-select: none; // 防止拖动时选中文本
  touch-action: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.aplayer-volume {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 5px;
  transition: all 0.3s ease;
  background: #b7daff;
  height: 70%;
}

// 移动端隐藏音量控制
@media screen and (max-width: 768px) {
  .aplayer-volume-wrap {
    display: none !important;
  }
}
</style>
