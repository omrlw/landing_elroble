# El Roble

- Conserva el diseño y las interacciones de la landing al cambiar su implementación. Consulta [DESIGN.md](DESIGN.md) para los estilos y patrones compartidos.
- La página se ensambla en `src/pages/index.astro`. Reutiliza los componentes de `src/components`, los tokens de `src/styles/global.css` y los datos compartidos de `src/config`.
- Importa imágenes de `src/assets` con `astro:assets` para generar variantes adaptables. Usa `public` para recursos que deban conservar una URL fija y para las licencias de las fuentes.
- Ejecuta `npm run check` y `npm run build` antes de entregar. Para cambios visuales o interactivos, valida la compilación con `npm run preview` en móvil y escritorio.
