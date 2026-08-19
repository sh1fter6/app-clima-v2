# ☁️ ClimaChile 1.1

![App Version](https://img.shields.io/badge/Version-1.1-blue?style=for-the-badge)
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

**ClimaChile 1.1** es una Single Page Application (SPA) moderna desarrollada con **Vue 3** y **Vite** para consultar el clima en tiempo real de todo Chile. Este proyecto representa la versión final (Módulo Final / Portafolio) del bootcamp, integrando todas las tecnologías vistas en módulos anteriores, destacando un diseño avanzado (*Glassmorphism*) y el uso de las mejores prácticas en el manejo del estado global.

## 🚀 Despliegue (En Vivo)

Puedes ver la aplicación funcionando en el siguiente enlace:
👉 **[Ver ClimaChile en vivo](https://sh1fter6.github.io/app-clima-v2/#/)**

## ✨ Características Principales

*   **Integración de API en Tiempo Real**: Consume datos reales de [Open-Meteo API](https://open-meteo.com/), gestionando estados de carga y manejo de errores nativo.
*   **Manejo de Estado Moderno (Pinia)**: 
    *   *Nota Arquitectónica*: Como modernización proactiva del requerimiento de *Vuex*, este proyecto utiliza **Pinia** (oficialmente Vuex 5 y el estándar actual de Vue).
    *   Pinia se encarga de guardar un caché (LRU) de los datos del clima consultados, evitando saturar la API, además de gestionar la sesión del usuario.
*   **Sistema de Autenticación en Frontend**: Posee un login de testeo (protegido por *Navigation Guards* de Vue Router) implementado en Pinia para simular un inicio de sesión persistente con LocalStorage.
*   **Alertas y Estadísticas Meteorológicas**: 
    *   La vista de detalle procesa los datos brutos de la API para generar estadísticas (máximas, mínimas, promedios) a nivel semanal.
    *   Motor de **alertas meteorológicas** automatizadas (e.g., Alerta por altas temperaturas o lluvias fuertes) calculadas dinámicamente según los pronósticos.
*   **UX / UI Avanzada**:
    *   Diseño **Glassmorphism**: Componentes translúcidos con desenfoque de fondo (`backdrop-filter`) para una sensación ultra-premium.
    *   Mapa topológico de Chile (usando *D3 Geo*).
    *   Responsive Web Design completo, transformando controles inteligentemente en versión móvil (ej: barra de búsqueda interactiva y botones circulares 1:1).

## 🗂️ Rutas de la Aplicación

| Ruta | Descripción |
| :--- | :--- |
| `/` | **Home**: Mapa interactivo y tarjetas de clima de capitales regionales en tiempo real. |
| `/login` | **Autenticación**: Vista para iniciar sesión y guardar preferencias. |
| `/:region` | **Región**: Lista de todas las comunas de una región específica y su estado climático. |
| `/:region/:city`| **Detalle**: Estadísticas semanales, gráficos y alertas para una comuna en particular. |
| `/*` | **404 Not Found**: Página amigable para rutas inexistentes. |

## 🛠️ Tecnologías y Librerías

*   **Vue 3 (Composition API)** - *Core del Frontend*
*   **Vite** - *Empaquetador y Servidor Dev*
*   **Vue Router 4** - *Navegación SPA*
*   **Pinia** - *Manejo de Estado (Vuex Moderno)*
*   **Axios** - *Cliente HTTP*
*   **D3 Geo & TopoJSON** - *Renderizado del mapa de Chile*

## ⚙️ Ejecución Local

Sigue estos pasos para correr el proyecto en tu máquina local:

1.  **Clona el repositorio** o descomprime el archivo ZIP.
2.  **Instala las dependencias**:
    Abre una terminal en la raíz del proyecto y ejecuta:
    ```bash
    npm install
    ```
3.  **Inicia el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
4.  **Abre tu navegador**:
    Visita `http://localhost:5173/` (o el puerto que indique la terminal).

> **Test de Login**: Puedes usar el correo `admin@clima.cl` y contraseña `password123` para probar la autenticación. No requiere configuraciones de `.env` adicionales.

---
*Desarrollado como proyecto de portafolio.*