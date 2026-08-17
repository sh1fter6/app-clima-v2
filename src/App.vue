<script setup>
</script>

<template>
  <div class="weather-app">
    <!-- Nubes de fondo -->
    <div class="background-decorations">
      <div class="bg-cloud bg-cloud--1"></div>
      <div class="bg-cloud bg-cloud--2"></div>
      <div class="bg-cloud bg-cloud--3"></div>
    </div>

    <!-- Header & Navigation con Vue Router -->
    <header class="weather-header">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm weather-nav">
        <div class="container">
          <router-link class="navbar-brand d-flex align-items-center weather-nav__brand" to="/">
            <i class="fa-solid fa-cloud-sun fs-4 me-2 text-warning"></i><strong>ClimaApp</strong>
          </router-link>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto weather-nav__list">
              <li class="nav-item">
                <router-link class="nav-link weather-nav__link" to="/">Inicio</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link weather-nav__link" to="/lugar/1">Detalle (Santiago)</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <!-- Router View -->
    <router-view></router-view>

    <!-- Footer -->
    <footer class="footer mt-auto py-4 bg-dark text-light border-top border-secondary weather-footer">
      <div class="container text-center">
        <p class="mb-1 weather-footer__copy">&copy; 2026 ClimaApp. Módulo 6 - Frontend SPA (Vue 3, SFC & Vue Router).</p>
        <small class="text-secondary weather-footer__tech">Desarrollado con Vue 3 Single File Components, Vite y SASS.</small>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
</style>
