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

## Ilustraciones botánicas

- La rama, la hoja, las bellotas y la madera comparten acabado mate, nervaduras y vetas finas y tonos de oliva, salvia y madera.
- [BotanicalArt.astro](src/components/BotanicalArt.astro) usa un mismo espacio de 4 a 8 rem de ancho y una opacidad común. Ajusta cada silueta dentro de ese espacio para equilibrar su peso. La rama completa de Recorrido ocupa todo el ancho y Preguntas frecuentes reserva el detalle de hoja suelta.
- Los motivos se sitúan a la derecha de su grupo de contenido, con la misma separación. Confianza, Centro de día y Preguntas frecuentes agrupan el texto y la llamada a la acción. Recorrido combina la rama con su encabezado.
- [BotanicalPattern.astro](src/components/BotanicalPattern.astro) sitúa los anillos de crecimiento en la esquina inferior de Programa en todos los tamaños. Las secciones de descanso visual dejan el protagonismo a la fotografía y al contenido.

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

## Movimiento

- Usa Historia como referencia. El movimiento guía la mirada entre escenas. Primero destaca un detalle, después abre el encuadre para mostrar su contexto y deja una pausa para leer antes de la siguiente transición.
- Mantén las esquinas redondeadas durante toda la apertura de una escena y deja margen entre el marco y la pantalla. Retira el texto saliente antes de que la siguiente imagen lo cubra.
- Para el texto, usa desplazamientos cortos y la curva `--ease-soft`. Para los cambios de plano ligados al scroll, usa una curva de entrada y salida suave. Reserva las secuencias fijadas para momentos narrativos en pantallas con espacio suficiente.
- En pantallas pequeñas, conserva el orden de lectura y vincula el movimiento a cada imagen. Con movimiento reducido, presenta el relato completo en el flujo normal con sus enlaces y acciones.
