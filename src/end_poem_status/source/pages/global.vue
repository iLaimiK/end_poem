<script setup lang="ts">
import { computed, ref } from 'vue'
import AnomalyDisplay from '../components/anomaly-display.vue'
import PlotDisplay from '../components/plot-display.vue'
import StatusCard from '../components/status-card.vue'
import { useAppData } from '../composables/useAppData'

// 使用应用数据组合式API
const { worldData } = useAppData()

// 剧情记录的展开状态
const isPlotExpanded = ref(false)

const togglePlotExpand = () => {
  isPlotExpanded.value = !isPlotExpanded.value
}

// 计算属性，从真实数据中提取显示数据
const displayData = computed(() => {
  const globalInfo = worldData.value.全局信息
  const plotRecord = worldData.value.plot_record

  return {
    date: globalInfo.日期 || '未知',
    time: globalInfo.时间 || '未知',
    location: globalInfo.当前位置 || '未知区域',
    weather: globalInfo.天气 || '未知',
    anomalies: globalInfo.异常 || {},
    plotProgress: plotRecord.剧情进度 || 'v1',
    plotNodes: plotRecord.剧情节点记录 || ['暂无剧情节点记录']
  }
})

// SVG 图标路径常量
const iconPaths = {
  clock: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z",
  location: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z",
  weather: "M12,18C8.69,18 6,15.31 6,12A6,6 0 0,1 12,6C15.31,6 18,8.69 18,12A6,6 0 0,1 12,18M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,1L15.39,4.39L12,7.78L8.61,4.39L12,1M1,12L4.39,8.61L7.78,12L4.39,15.39L1,12M16.22,12L19.61,8.61L23,12L19.61,15.39L16.22,12M12,16.22L15.39,19.61L12,23L8.61,19.61L12,16.22Z",
  warning: "M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z",
  document: "M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
}
</script>

<template>
  <div class="world-status-container">
    <div class="world-status-grid">
      <!-- 时序信息卡片 -->
      <StatusCard
        title="时序记录"
        card-class="time-card"
        grid-area="time"
        :icon-path="iconPaths.clock"
        indicator-class="time-indicator"
      >
        <div class="data-row">
          <span class="data-label">日期</span>
          <span class="time-value">{{ displayData.date }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">时间</span>
          <span class="time-value">{{ displayData.time }}</span>
        </div>
      </StatusCard>

      <!-- 空间定位卡片 -->
      <StatusCard
        title="空间坐标"
        card-class="location-card"
        grid-area="location"
        :icon-path="iconPaths.location"
        indicator-class="location-indicator"
      >
        <div class="data-center">
          <span class="location-value">{{ displayData.location }}</span>
        </div>
      </StatusCard>

      <!-- 环境监测卡片 -->
      <StatusCard
        title="环境数据"
        card-class="weather-card"
        grid-area="weather"
        :icon-path="iconPaths.weather"
        indicator-class="weather-indicator"
      >
        <div class="data-center">
          <span class="weather-value">{{ displayData.weather }}</span>
        </div>
      </StatusCard>

      <!-- 异常监控卡片 -->
      <StatusCard
        title="现实异常监控"
        card-class="anomaly-card"
        grid-area="anomaly"
        :icon-path="iconPaths.warning"
        indicator-class="anomaly-indicator"
      >
        <AnomalyDisplay :anomalies="displayData.anomalies" />
      </StatusCard>

      <!-- 剧情记录卡片 -->
      <StatusCard
        title="剧情记录"
        card-class="plot-card"
        grid-area="plot"
        :icon-path="iconPaths.document"
        :show-indicator="false"
      >
        <template #action>
          <button
            class="plot-expand-btn"
            :class="{ expanded: isPlotExpanded }"
            @click="togglePlotExpand"
            aria-label="展开/收起剧情记录"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path d="M7,10L12,15L17,10H7Z" />
            </svg>
          </button>
        </template>
        <PlotDisplay
          :plot-progress="displayData.plotProgress"
          :plot-nodes="displayData.plotNodes"
          :is-expanded="isPlotExpanded"
        />
      </StatusCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.world-status-container {
  width: 100%;
}

.world-status-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'time location weather'
    'anomaly anomaly anomaly'
    'plot plot plot';
}

// 数据显示样式
.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.data-center {
  display: flex;
  margin: 1rem;
  align-items: center;
  justify-content: center;
}

.data-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
  min-width: 80px;
}

.time-value {
  color: var(--accent-blue);
  font-family: 'Consolas', 'Monaco', monospace;
  text-shadow: 0 0 8px rgba(74, 158, 255, 0.3);
  font-size: 0.95rem;
  font-weight: 600;
}

.location-value {
  color: var(--accent-purple);
  font-style: italic;
  font-size: 1rem;
  font-weight: 600;
}

.weather-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 1rem;
}

// 剧情展开按钮样式
.plot-expand-btn {
  background: none;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: auto;

  &:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
  }

  &.expanded {
    transform: rotate(180deg);
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.3);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .world-status-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    grid-template-areas:
      'time'
      'location'
      'weather'
      'anomaly'
      'plot';
  }
}
</style>
