<template>
  <div class="map_graph">
    <div class="map_container">
      <div class="map_title_bar">
        <div class="map_title">{{ title }}</div>
        <div class="map_movement"><i :class="movementIcon.class"></i>{{ movementIcon.text }}</div>
      </div>
      <div class="monitor-screen" :class="{ grabbing: isDragging }">
        <canvas ref="mapCanvas"></canvas>

        <!-- 使用独立的控制组件 -->
        <MapControls @zoom-in="handleZoomIn" @zoom-out="handleZoomOut" @reset-view="handleResetView" />

        <!-- 缩放提示 -->
        <div class="zoom_indicator" v-if="showZoomIndicator">{{ Math.round(currentZoom * 100) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { CanvasRenderer } from '../core/canvas-renderer';
import { MapInteraction } from '../core/map-interaction';
import { MapParser } from '../core/map-parser';
import { MapData } from '../types';
import MapControls from './MapControls.vue';

// Props
interface Props {
  mapText: string;
}

const props = defineProps<Props>();

// Refs
const mapCanvas = ref<HTMLCanvasElement | null>(null);

// State
let renderer: CanvasRenderer | null = null;
let interaction: MapInteraction | null = null;
let resizeObserver: ResizeObserver | null = null;
const mapData = ref<MapData | null>(null);
const isDragging = ref<boolean>(false);
const currentZoom = ref<number>(1);
const showZoomIndicator = ref<boolean>(false);
let zoomIndicatorTimer: number | null = null;

// Computed
const title = computed(() => {
  return mapData.value?.metadata.description || '交互式地图系统';
});

const movementIcon = computed(() => {
  const icons = {
    F: { class: 'fa-solid fa-arrows-alt', text: '自由移动模式' },
    A: { class: 'fa-solid fa-route', text: '临近移动模式' },
    N: { class: 'fa-solid fa-ban', text: '禁止移动模式' },
  };

  return icons[mapData.value?.free_movement || 'A'] || icons['A'];
});

// Methods
const parseMapData = () => {
  if (!props.mapText) return;

  try {
    mapData.value = MapParser.parseMapData(props.mapText);
  } catch (error) {
    console.error('[MapComponent] 解析地图数据失败:', error);
  }
};

const initializeRenderer = () => {
  if (!mapCanvas.value || !mapData.value) return;

  try {
    renderer = new CanvasRenderer(mapCanvas.value);
    renderer.setMapData(mapData.value);

    // 初始化交互控制器
    interaction = new MapInteraction(mapCanvas.value, renderer);

    setupDragStateListener();
    setupCanvasResize();
    updateZoomIndicator();
  } catch (error) {
    console.error('[MapComponent] 渲染器初始化失败:', error);
  }
};

/**
 * 处理放大事件
 */
const handleZoomIn = () => {
  if (!interaction) return;
  interaction.zoomIn();
  updateZoomIndicator();
  showZoomIndicatorTemporarily();
};

/**
 * 处理缩小事件
 */
const handleZoomOut = () => {
  if (!interaction) return;
  interaction.zoomOut();
  updateZoomIndicator();
  showZoomIndicatorTemporarily();
};

/**
 * 处理重置视图事件
 */
const handleResetView = () => {
  if (!interaction || !renderer) return;
  const mapBounds = renderer.getMapBounds();
  interaction.resetView(mapBounds || undefined);
  updateZoomIndicator();
  showZoomIndicatorTemporarily();
};

/**
 * 设置拖拽状态监听
 */
const setupDragStateListener = () => {
  if (!mapCanvas.value) return;

  let dragTimeout: number;
  const canvas = mapCanvas.value;

  const startDrag = () => {
    isDragging.value = true;
    clearTimeout(dragTimeout);
  };

  const endDrag = () => {
    clearTimeout(dragTimeout);
    dragTimeout = setTimeout(() => {
      isDragging.value = false;
    }, 100);
  };

  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('touchstart', startDrag);
  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('mouseleave', endDrag);
  canvas.addEventListener('touchend', endDrag);
};

/**
 * 更新缩放指示器
 */
const updateZoomIndicator = () => {
  if (renderer) {
    currentZoom.value = renderer.getViewState().scale;
  }
};

/**
 * 临时显示缩放指示器
 */
const showZoomIndicatorTemporarily = () => {
  showZoomIndicator.value = true;

  if (zoomIndicatorTimer) {
    clearTimeout(zoomIndicatorTimer);
  }

  zoomIndicatorTimer = setTimeout(() => {
    showZoomIndicator.value = false;
  }, 1500);
};

const setupCanvasResize = () => {
  if (!mapCanvas.value || !renderer) return;

  resizeObserver = new ResizeObserver(() => {
    if (renderer) {
      renderer.render();
    }
  });

  resizeObserver.observe(mapCanvas.value);
};

const cleanup = () => {
  if (renderer) {
    renderer.cleanup();
    renderer = null;
  }

  if (interaction) {
    interaction.cleanup();
    interaction = null;
  }

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (zoomIndicatorTimer) {
    clearTimeout(zoomIndicatorTimer);
    zoomIndicatorTimer = null;
  }
};

// Watchers
watch(
  () => props.mapText,
  () => {
    parseMapData();
    if (mapData.value && renderer) {
      renderer.setMapData(mapData.value);
    }
  },
  { immediate: true },
);

// Lifecycle
onMounted(() => {
  parseMapData();

  // 在移动端需要更长的延迟确保DOM完全就绪和容器尺寸稳定
  const delay = window.innerWidth <= 768 ? 200 : 100;
  setTimeout(() => {
    initializeRenderer();
  }, delay);
});

onUnmounted(() => {
  cleanup();
});
</script>

<style lang="scss" scoped>
.map_graph {
  font-family: 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', sans-serif;
  color: rgba(232, 234, 240, 0.8);
  margin: 15px 0;
  position: relative;
  z-index: 1;

  .map_container {
    background-color: #16213e;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid #e8eaf0;
    position: relative;
    overflow: hidden;
  }

  .map_title_bar {
    text-align: center;

    .map_title {
      color: #e8eaf0;
      font-size: 1.1rem;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    i {
      color: #4a9eff;
      margin-right: 8px;
    }
  }

  .monitor-screen {
    background-color: rgba(22, 33, 62, 0.5);
    border: 1px solid #8baac7;
    padding: 5px;
    box-shadow: 0 0 20px rgba(74, 158, 255, 0.2) inset;
    position: relative;
    overflow: hidden;
    width: 100%;
    min-height: 600px;
    cursor: grab;
    border-radius: 4px;
    // 确保在移动端的稳定性
    touch-action: pan-x pan-y;

    &.grabbing {
      cursor: grabbing !important;
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
      background-color: transparent;
    }

    .zoom_indicator {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(22, 33, 62, 0.9);
      border: 1px solid #4a9eff;
      border-radius: 6px;
      padding: 8px 12px;
      color: #e8eaf0;
      font-size: 14px;
      font-weight: bold;
      z-index: 10;
      opacity: 0.9;
      transition: opacity 0.3s ease;
      user-select: none;
      pointer-events: none;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map_graph {
    margin: 10px 0;

    .map_container {
      padding: 8px 4px 4px 4px;
    }

    .monitor-screen {
      min-height: 400px;
      padding: 3px;
      // 优化触摸体验
      touch-action: manipulation;

      .zoom_indicator {
        top: 8px;
        left: 8px;
        padding: 6px 10px;
        font-size: 12px;
      }
    }

    .map_title_bar {
      .map_title {
        font-size: 1.1rem;
      }

      .map_movement {
        font-size: 0.9rem;
      }
    }
  }
}

// 针对更小屏幕的优化
@media (max-width: 480px) {
  .map_graph {
    .monitor-screen {
      min-height: 300px;

      .zoom_indicator {
        top: 6px;
        left: 6px;
        padding: 4px 8px;
        font-size: 11px;
        border-radius: 4px;
      }
    }

    .map_title_bar {
      .map_title {
        font-size: 1rem;
      }
    }
  }
}
</style>
