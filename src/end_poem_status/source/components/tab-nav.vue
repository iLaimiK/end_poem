<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const tabItems = [
  { path: '/global', label: '世界状态', name: 'Global' },
  { path: '/primary-role', label: '旅行同伴', name: 'PrimaryRole' },
  { path: '/plot-role', label: '邂逅之人', name: 'PlotRole' },
];

const handleTabClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <nav class="tab-nav">
    <button
      v-for="item in tabItems"
      :key="item.name"
      class="tab-button"
      :class="{ active: route.name === item.name }"
      @click="handleTabClick(item.path)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<style lang="scss" scoped>
.tab-nav {
  display: flex;
  border-bottom: 1px solid var(--glass-border);
  position: relative;
}

.tab-button {
  flex: 1;
  padding: 1rem 0.75rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    color: var(--text-secondary);
    background: rgba(139, 170, 199, 0.05);
  }

  &.active {
    color: var(--text-primary);

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
    }
  }
}
</style>
