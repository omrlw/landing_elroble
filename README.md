# El Roble

Landing del centro de día para adultos mayores en Arequipa. El proyecto genera un sitio estático con Astro.

## Desarrollo

Requiere Node.js 22.12 o posterior.

```sh
npm ci
npm run dev
```

## Producción

Configura `SITE_URL` con la URL pública del sitio en el entorno de compilación para generar la URL canónica y `og:url`.

```sh
npm run check
npm run build
npm run preview
```

Publica el contenido de `dist/` en el alojamiento estático.

Los datos de contacto y los enlaces se editan en `src/config/business.ts`. El sistema visual se documenta en [DESIGN.md](DESIGN.md).
