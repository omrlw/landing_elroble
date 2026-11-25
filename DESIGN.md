# Sistema visual de El Roble

La landing del centro de día combina fotografía cotidiana, fondos cálidos y verde bosque. Cormorant Garamond da voz a los títulos. Google Sans Flex se usa para lectura, navegación y controles.

Los valores y combinaciones compartidas viven en [global.css](src/styles/global.css). Las secciones definen la composición y eligen los estilos por su función.

## Paleta

| Función | Tokens |
| --- | --- |
| Fondo general | `--color-cream` (`#f4f1ec`) |
| Tarjetas y lectura sobre claro | `--color-paper` (`#fcfaf5`) y `--surface-paper` |
| Transiciones cálidas y estados de navegación | `--color-sand` (`#e8e2d6`) y `--surface-light-wash` |
| Títulos y texto | `--color-ink` (`#142013`) y `--color-text` (`#3d3935`) |
| Secciones y paneles verdes | `--surface-forest` con un reflejo tenue sobre `--color-section-forest` (`#233322`) que termina en `--color-forest` (`#1c2b1a`). |
| Acciones principales | `--surface-action`, de `--color-action` (`#2b4027`) a bosque |
| Acentos de roble | `--color-oak` (`#532d12`) en titulares, `--color-oak-highlight` (`#8a541f`) en la promoción y `--color-honey` (`#e8d7b9`) en detalles cálidos |

Usa `--color-paper` o `--color-cream` para texto principal sobre bosque y `--color-on-forest-muted` para texto secundario. Los paneles dentro de una sección verde pueden usar `--surface-on-forest`.

## Glass

- Usa `.liquid-glass` para controles y texto superpuestos a fotografías, con tinte verde y texto papel. El tinte mantiene la legibilidad al cambiar de foto.
- Añade `.liquid-glass--light` para rótulos sobre fotos y la franja de credenciales del hero. Las tarjetas de Testimonios usan la misma variante con un tinte más translúcido sobre el fondo verde. La variante comparte el desenfoque de 12 px. Ambos tintes tienen un fondo sólido de respaldo.
- Usa `.gallery-pagination` en los carruseles para compartir el tinte verde, los indicadores y el botón circular de pausa cuando hay reproducción automática.
- Usa `.liquid-glass--lens` para iconos pequeños con un reflejo radial. Las esferas decorativas usan `--glass-ornament`. Estos acabados funcionan sin desenfoque.
- En tarjetas de lectura, como programa y preguntas frecuentes, usa `--surface-paper`. Reserva `--surface-honey` para destacados.

## Sombras y estados

- `--shadow-control` para botones pequeños, paginadores y controles.
- `--shadow-card` para tarjetas y fotos dentro de una misma sección.
- `--shadow-raised` para elementos que sobresalen, como el menú móvil y los marcos de fotos principales.
- `--shadow-cutout` para ilustraciones cuyo contorno define la sombra.
- `--highlight-light` y `--highlight-dark` para el reflejo interior de cada material.

Las llamadas a la acción se construyen con [Cta.astro](src/components/Cta.astro). Usa la variante `primary` para superficies claras, `light` para secciones verdes y `glass` sobre fotografías. El foco del componente combina un contorno bosque con un borde papel para que se vea sobre superficies claras y oscuras.
