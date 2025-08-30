<script setup lang="ts">
interface Props {
  anomalies: Record<string, string>
}

const props = defineProps<Props>()
</script>

<template>
  <div class="anomaly-display">
    <div class="anomaly-header">
      <div class="anomaly-status-text">
        <span class="anomaly-count">检测到 {{ Object.keys(anomalies).length }} 种异常</span>
      </div>
    </div>
    <div class="anomaly-list">
      <div
        v-for="(description, type) in anomalies"
        :key="type"
        class="anomaly-item"
        data-severity="medium"
      >
        <div class="anomaly-severity"></div>
        <div class="anomaly-content">
          <div class="anomaly-type">{{ type }}</div>
          <div class="anomaly-description">{{ description }}</div>
        </div>
      </div>
    </div>
    <div class="anomaly-footer">
      <div class="anomaly-monitor">
        <span class="anomaly-monitor-indicator"></span>
        <span class="anomaly-monitor-text">实时监控中...</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.anomaly-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.anomaly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 107, 107, 0.2);
}

.anomaly-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.anomaly-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.anomaly-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.08);
  border-color: rgba(255, 107, 107, 0.25);
  border-radius: 8px;
  border-left: 3px solid #ff6b6b;
}

.anomaly-severity {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.75rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
  background: #ff6b6b;
}

.anomaly-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.anomaly-type {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
}

.anomaly-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.anomaly-footer {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 107, 107, 0.1);
}

.anomaly-monitor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.anomaly-monitor-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-teal);
}
</style>