<script lang="ts" setup></script>

<template>
  <section class="tab-content">
    <router-view>
      <template #default="{ Component, route }">
        <transition name="fade-transform" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </template>
    </router-view>
  </section>
</template>

<style lang="scss" scoped>
.tab-content {
  padding: 1rem;
  overflow: hidden; /* 防止过渡期间内容溢出 */
}

/* fade-transform */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
