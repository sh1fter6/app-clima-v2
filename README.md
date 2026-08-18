# ClimaApp - Módulo 6 (SPA con Vue 3 & Vue Router)

Aplicación de clima responsiva reestructurada como una **Single Page Application (SPA)** moderna construida con **Vue 3 (Single File Components - SFC)**, **Vite**, **Vue Router 4** y **SASS**.

## Vistas Principales y Rutas (Vue Router)
Navegación del lado del cliente sin recargar la página:

1. **`HomeView` (`/`):**
   - Muestra el listado dinámico de ciudades con sus condiciones climáticas actuales.
   - Formulario de búsqueda reactivo con enlace bidireccional mediante directiva `v-model`.
   - Renderizado condicional `v-if` / `v-else` para manejar búsquedas sin resultados.

2. **`DetailView` (`/lugar/:id`):**
   - Ruta dinámica que despliega la información extendida de la ciudad seleccionada.
   - Selector interactivo de unidades de temperatura (`°C` / `°F`) con enlace reactivo.
   - Pronóstico semanal renderizado dinámicamente con `v-for`.
   - Sección de estadísticas semanales y Alertas Climáticas.

## Directivas y Reactividad de Vue 3
- `{{ }}`: Interpolación de variables reactivas (temperaturas, nombres, estados).
- `v-for`: Renderizado de listas de tarjetas de ciudades y pronósticos diarios.
- `v-if` / `v-else`: Control condicional de estados vacíos y banners de alerta.
- `v-model`: Enlace de datos de dos vías (*two-way binding*) para la búsqueda en vivo e intercambio de unidades térmicas.
- `@click`: Manejo de eventos interactivos y navegación programática.

## Instrucciones para Ejecutar Localmente
1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
3. **Construir bundle de producción:**
   ```bash
   npm run build
   ```

## Enlaces del Proyecto
- **Repositorio Público GitHub:** https://github.com/sh1fter6/weather-frontend-m2
- **GitHub Pages:** https://sh1fter6.github.io/weather-frontend-m2/