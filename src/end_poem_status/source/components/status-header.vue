<script setup lang="ts"></script>

<template>
  <div class="status-header">
    <h1 class="status-title">Elegy for the End</h1>
  </div>
</template>

<style lang="scss" scoped>
.status-header {
  text-align: center;
  padding: 1.2rem 1rem 1rem 1rem;
  border-bottom: 1px solid var(--glass-border);
  position: relative;
  background: rgba(139, 170, 199, 0.05);
}

.status-title {
  font-family: 'Great Vibes', 'Allura', 'Dancing Script', 'Kaushan Script', cursive;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 400;
  position: relative;
  text-shadow: 0 0 20px rgba(74, 158, 255, 0.5), 0 0 30px rgba(99, 102, 241, 0.3),
    0 0 40px rgba(20, 184, 166, 0.15);
  background: linear-gradient(
    45deg,
    #e8eaf0 0%,
    #c8d1e0 20%,
    #8baac7 40%,
    #5a6b7d 60%,
    #8baac7 80%,
    #c8d1e0 90%,
    #e8eaf0 100%
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  transform: translateY(-3px) rotate(-1deg);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));

  &::before,
  &::after {
    content: 'Elegy for the End';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    font-family: 'Great Vibes', 'Allura', cursive;
  }

  &::before {
    color: rgba(139, 170, 199, 0.25);
    z-index: -1;
    transform: rotate(-1deg);
  }

  &::after {
    color: rgba(90, 107, 125, 0.15);
    z-index: -2;
    transform: rotate(1deg);
  }
}
</style>