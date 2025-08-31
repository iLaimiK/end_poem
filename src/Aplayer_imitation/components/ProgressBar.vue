<script setup lang="ts">
import { computed, ref } from 'vue';
import { calculateProgress } from '../utils/audio';

interface Props {
  currentTime: number;
  duration: number;
  buffered: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  seek: [time: number];
}>();

const barRef = ref<HTMLElement>();

const playedProgress = computed(() => calculateProgress(props.currentTime, props.duration));

const bufferedProgress = computed(() => calculateProgress(props.buffered, props.duration));

const handleSeek = (event: MouseEvent) => {
  if (!barRef.value || !props.duration) return;

  const rect = barRef.value.getBoundingClientRect();
  const percentage = (event.clientX - rect.left) / rect.width;
  const seekTime = percentage * props.duration;

  emit('seek', Math.max(0, Math.min(props.duration, seekTime)));
};
</script>

<template>
  <div class="aplayer-bar-wrap" @click="handleSeek">
    <div class="aplayer-bar" ref="barRef">
      <div class="aplayer-loaded" :style="{ width: `${bufferedProgress}%` }"></div>
      <div class="aplayer-played" :style="{ width: `${playedProgress}%` }">
        <span class="aplayer-thumb"></span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.aplayer-bar-wrap {
  flex: 1;
  margin-right: 7px;
  padding: 4px 0;
  cursor: pointer;
}

.aplayer-bar {
  position: relative;
  height: 2px;
  width: 100%;
  background: #cdcdcd;
  cursor: pointer;
  border-radius: 1px;
}

.aplayer-loaded {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #aaa;
  height: 2px;
  transition: all 0.5s ease;
  width: 0;
  border-radius: 1px;
}

.aplayer-played {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  border-radius: 1px;
  background: #b7daff;
  transition: all 0.1s ease;
}

.aplayer-thumb {
  position: absolute;
  top: 50%;
  right: -4px;
  margin-top: -4px;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: scale(0);
  opacity: 0;
  background: #b7daff;
}

.aplayer-bar-wrap:hover .aplayer-thumb {
  transform: scale(1);
  opacity: 1;
}
</style>
