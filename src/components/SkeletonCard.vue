<template>
  <div class="weather-card skeleton-card">
    <div class="weather-card__header">
      <div>
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
      </div>
      <div class="skeleton-line skeleton-badge"></div>
    </div>

    <div class="weather-card__icon-wrap">
      <div class="skeleton-circle"></div>
    </div>

    <div class="skeleton-line skeleton-temp"></div>
    <div class="skeleton-line skeleton-condition"></div>

    <div class="weather-card__hourly">
      <div v-for="i in 6" :key="i" class="weather-card__hour">
        <div class="skeleton-line skeleton-hour-time"></div>
        <div class="skeleton-circle skeleton-hour-icon"></div>
        <div class="skeleton-line skeleton-hour-temp"></div>
      </div>
    </div>

    <div class="weather-card__minmax">
      <div class="skeleton-line skeleton-minmax"></div>
      <div class="skeleton-line skeleton-minmax"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  pointer-events: none;
}

.skeleton-line,
.skeleton-circle {
  background: #3a3a3a;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.15) 60%,
    rgba(255, 255, 255, 0)
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

.skeleton-circle {
  border-radius: 50%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-title {
  height: 20px;
  width: 120px;
  margin-bottom: 8px;
}
.skeleton-subtitle {
  height: 12px;
  width: 150px;
}
.skeleton-badge {
  height: 22px;
  width: 60px;
  border-radius: 12px;
}
.skeleton-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.skeleton-temp {
  height: 40px;
  width: 80px;
  margin: 10px auto;
}
.skeleton-condition {
  height: 14px;
  width: 120px;
  margin: 0 auto 20px;
}

.skeleton-hour-time { height: 12px; width: 30px; margin: 0 auto 8px; }
.skeleton-hour-icon { width: 30px; height: 30px; margin: 0 auto 8px; }
.skeleton-hour-temp { height: 14px; width: 30px; margin: 0 auto; }

.skeleton-minmax {
  height: 14px;
  width: 60px;
}
</style>
