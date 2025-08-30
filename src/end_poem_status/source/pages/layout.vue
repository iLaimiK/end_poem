<script lang="ts" setup>
import AppMain from '../components/app-main.vue';
import StatusHeader from '../components/status-header.vue';
import TabNav from '../components/tab-nav.vue';
</script>

<template>
  <div class="app-wrapper">
    <!-- header -->
    <status-header />
    <!-- content -->
    <div class="main-container">
      <tab-nav />
      <app-main />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  overflow: hidden;
  backdrop-filter: var(--theme-backdrop-filter);
  background: var(--main-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-soft);
  contain: layout style;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
  }
}

.main-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
  background: var(--glass-bg);
}
</style>
