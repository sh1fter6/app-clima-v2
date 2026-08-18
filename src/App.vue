<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="app-layout">
    <NavBar />

    <router-view></router-view>
  </div>
</template>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
/* Evitamos que router-view se solape incorrectamente */
.app-layout > :not(.sticky-nav) {
  flex: 1;
}

</style>
