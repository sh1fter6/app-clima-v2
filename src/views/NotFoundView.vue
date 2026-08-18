<template>
  <div class="not-found-page">
    <div class="content-wrapper">
      <div class="not-found-main">
        <h1 class="huge-404">404</h1>
        <svg class="map-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2ZM12 4C14.7614 4 17 6.23858 17 9C17 12.3996 12.9234 18.2323 12 19.4673C11.0766 18.2323 7 12.3996 7 9C7 6.23858 9.23858 4 12 4Z" fill="currentColor"/>
          <!-- Signos de interrogación ?? -->
          <text x="12" y="11" text-anchor="middle" fill="currentColor" font-size="5" font-weight="bold" font-family="sans-serif">??</text>
        </svg>
      </div>
      <p class="subtitle">lo siento, no encontramos este lugar...</p>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  background-color: #000000;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  padding-top: 80px; /* Para que no lo tape el nav */
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* El ancho delimitado al mismo ancho que el 404 gigante */
  display: inline-flex;
}

.not-found-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.huge-404 {
  font-size: 10rem;
  font-weight: 200; /* Letra fina */
  margin: 0;
  line-height: 1;
  letter-spacing: -4px;
}

.map-icon {
  width: 6rem;
  height: 6rem;
  color: #555555;
}

.subtitle {
  margin: 1rem 0 0 0;
  font-size: 1rem;
  color: #888888;
  font-weight: 300;
  text-align: center;
  width: 100%;
  display: block;
}
</style>
