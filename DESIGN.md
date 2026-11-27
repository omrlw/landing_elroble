# Sistema visual de El Roble

La landing del centro de día combina fotografía cotidiana, fondos cálidos y verde bosque. Cormorant Garamond da voz a los títulos. Google Sans Flex se usa para lectura, navegación y controles.

Los valores y combinaciones compartidas viven en [global.css](src/styles/global.css). Las secciones definen la composición y eligen los estilos por su función.

## Tipografía

| Función | Token | Tamaño |
| --- | --- | --- |
| Titular del hero | `--text-hero` | 34–80 px |
| Títulos de sección | `--text-section` | 32–64 px |
| Subtítulos y llamadas editoriales | `--text-subheading` | 28–38 px |
| Títulos de tarjetas, actividades y preguntas | `--text-item` | 22–31 px |
| Texto de lectura | `--text-copy` | 16–18 px |
| Llamadas a la acción | `--text-cta` | 17–18 px |
| Controles secundarios y etiquetas | `--text-control` | 16 px |
| Índices y datos secundarios | `--text-meta` | 14 px |

Los rangos corresponden a una raíz de 16 px. Los títulos usan Cormorant Garamond en peso 700. Los textos de lectura y controles usan Google Sans Flex. Las tres escenas de Historia usan `--text-section`. Los rótulos de Confianza, Centro de día y Preguntas frecuentes comparten tamaño e interlineado. Las llamadas a la acción del contenido comparten una altura mínima de 60 px. La cabecera fija conserva su variante compacta.

## Espaciado

| Relación | Token | Tamaño |
| --- | --- | --- |
| Detalles de un mismo elemento | `--space-detail` | 8 px |
| Título y descripción, texto y botón | `--space-related` | 12–20 px |
| Márgenes internos de tarjetas | `--space-inset` | 16–32 px |
| Encabezado y contenido, filas y grupos | `--section-gap` | 24–48 px |
| Transiciones amplias | `--space-section` | 40–76 px |

Los rangos corresponden a una raíz de 16 px. Programa y Recorrido comparten un solo intervalo amplio en su fondo continuo. Los cambios de fondo permiten acercar los grupos a ambos lados del borde. El hero y Confianza conservan el espaciado de su composición. Las fotos escalonadas de Centro de día, Recorrido y Comunidad mantienen sus desplazamientos. En Historia, `--story-travel` determina la distancia de scroll de la secuencia fija. Los márgenes y separaciones de las escenas controlan el espacio visible.

Confianza y Centro de día usan una altura mínima de 52 px (`--control-row-min-height`). Las filas de Preguntas frecuentes tienen un mínimo adaptable de 68 a 80 px y de 12 a 16 px entre ellas. A partir de 640 px, las dos columnas se expanden de forma independiente. La lectura y el foco recorren cada columna de arriba abajo.

Centro de día abre con `--space-section`, igual que Programa. Usa ese mismo intervalo completo entre su último grupo y el panel verde de Enfoque. Entre Programa y Recorrido, el espacio visible se reparte entre las dos secciones.

## Paleta

| Función | Tokens |
| --- | --- |
| Fondo general | `--color-cream` (`#f4f1ec`), continuo en todo el landing. La cabecera y la escena clara de Historia parten del mismo crema. |
| Tarjetas y lectura sobre claro | `--color-paper` (`#fcfaf5`) y `--surface-paper` |
| Vidrio claro | `--glass-clear-tint`, de `--color-cream` sólido a 77% de opacidad. |
| Títulos y texto | `--color-ink` (`#142013`) y `--color-text` (`#3d3935`) |
| Secciones y paneles verdes | `--surface-forest`, un degradado vertical desde `--el-roble-forest-surface-top` hasta `--el-roble-forest-deep`. |
| Acciones principales | `--surface-action`, de `--color-action` (`#2b4027`) a bosque |
| Acentos de roble | `--color-oak` (`#532d12`) en titulares, `--color-oak-highlight` (`#8a541f`) en la promoción y `--color-honey` (`#e8d7b9`) en detalles cálidos |

Usa `--color-paper` o `--color-cream` para texto principal sobre bosque y `--color-on-forest-muted` para texto secundario. Los paneles dentro de una sección verde pueden usar `--surface-on-forest`.

## Iconos de acción

[ActionIcon.astro](src/components/ActionIcon.astro) concentra los trazados en una cuadrícula de 20 unidades con un trazo de 1,5, extremos y uniones redondeados. El icono toma el color de su control. El enlace o botón aporta el nombre accesible.

| Icono | Tamaño | Uso |
| --- | --- | --- |
| Flecha derecha | 16 px | Llamadas a la acción, incluida la de agendar en la cabecera |
| Flecha abajo | 20 px | Avanzar entre escenas de Historia |
| Flecha diagonal | 16 px | Enlace a publicaciones en TikTok |
| Más y menos | 16 px | Filas desplegables de Confianza y Preguntas frecuentes, con medallón de 28 px |
| Chevrón | 14 px | Abrir y cerrar «Nosotros» en la navegación |
| Menú y cerrar | 20 px | Abrir y cerrar la navegación móvil y cerrar la promoción |
| Reproducir y pausar | 14 px | Controles de reproducción automática de los carruseles |
| Reproducir | 24 px | Vistas previas de Comunidad |
| Teléfono | 16 y 20 px | Barra de cabecera compacta, menú móvil y contacto |
| Reloj, ubicación y correo | 20 px | Horario en el menú y enlaces de contacto |

Los puntos y las cápsulas de paginación indican la posición en el carrusel y usan `data-gallery-mark`.

## Pictogramas

[Pictogram.astro](src/components/Pictogram.astro) usa los SVG de [src/assets/icons](src/assets/icons). Cada dibujo ocupa aproximadamente 21 px en su eje principal dentro de una caja de 24 × 24 px. El trazo redondeado mide 1,55 px a ese tamaño y el dibujo toma el color del elemento que lo contiene.

| Uso | Caja | Pictogramas |
| --- | --- | --- |
| Centro de día, Enfoque, Programa y Recorrido | 24 px | Cerebro, movimiento, paleta, escucha, autonomía, familia, conversación, convivencia, fisioterapia, salud, programa integral, entrada, rampa, salón y detalles |
| Credenciales de portada | 20 px | Acreditación, centro de día, cuidado geriátrico y evaluación |
| Redes sociales | 20 px | TikTok, Instagram y Facebook |
| Identificador en fotos de Comunidad | 16 px | Marca de TikTok junto al nombre de perfil |

Los medallones de Enfoque, Programa y Recorrido miden 40 px. Centro de día y Programa comparten el mismo cerebro para memoria y estimulación cognitiva y la misma paleta para actividades creativas.

## Ilustraciones botánicas

- Las referencias de «Genial» fijan el acabado mate de lámina botánica, las nervaduras y vetas finas y la paleta oliva y miel. Los motivos generados con ImageGen conservan esos rasgos y el recorte transparente.
- La hoja del hero nace junto al final del título. Historia abre con un brote y retoma el corte de madera en la escena del jardín.
- Enfoque y Recorrido usan la ramita original de «Genial». En Enfoque queda reducida y con aire alrededor. Programa combina la rama izquierda original con un brote nuevo a la derecha y abre espacio a ambos lados de las tarjetas. En pantallas estrechas, el brote acompaña la transición al Recorrido.
- Testimonios y Preguntas frecuentes tienen una ramita en el encabezado. [BotanicalPattern.astro](src/components/BotanicalPattern.astro) sitúa los anillos de «Genial» al pie de Preguntas frecuentes.

## Fotografías de Historia

Las fotografías proceden del archivo de El Roble.

| Fotografías publicadas | Original |
| --- | --- |
| `manos-creando.jpg` y `detalle-cuentas.jpg` | `roble_fotos1/IMG_20260713_120241.jpg.jpeg` |
| `ronda-en-el-jardin.jpg` | `roble_fotos1/IMG_20260619_122622.jpg.jpeg` |
| `bingo-en-el-roble.jpg` | `roble_fotos2/IMG_20260917_120430.jpg.jpeg` |

## Vidrio y refracción

El vidrio óptico tiene un centro casi transparente y concentra la refracción en el borde. El reflejo fino define la forma sobre fondos lisos. Sobre fotos o follaje, el borde curva la imagen y el centro conserva el detalle. El texto y los iconos se componen por encima del efecto.

| Aplicación | Clases y uso |
| --- | --- |
| Lente óptica | [OpticalGlass.astro](src/components/OpticalGlass.astro) refracta el borde en la cabecera, el hero, los rótulos de Recorrido y la reproducción de Comunidad. El anfitrión usa `.liquid-glass--optical` cuando el control necesita una superficie propia. |
| Vidrio claro | `.liquid-glass--clear` comparte `--glass-clear-tint` entre botones secundarios y paginadores. `.liquid-glass--lens` da un reflejo radial a los controles pequeños. Sobre fotografía, el mismo crema admite más transparencia para que se vea la refracción. |
| Filas que se abren o seleccionan | `.liquid-glass--row` con `.liquid-glass--underlay` comparte el radio de Confianza y el fundido de opacidad gobernado por `--glass-row-motion`. Coloca `.liquid-glass__trigger` en el `summary`, botón o `label`. Usa `--glass-rest-visibility` para definir la opacidad en reposo o con la fila abierta o seleccionada. |
| Superficie de lectura | `.liquid-glass--reading` usa `--surface-paper` para las tarjetas claras de Programa, las tarjetas de Testimonios y las reseñas abiertas. El papel opaco mantiene el tono crema sobre el bosque. |
| Identidad de marca | `.liquid-glass--action` usa el degradado bosque con un reflejo fino. `.liquid-glass--oak` conserva el roble en «Descubre nuestro centro». `.liquid-glass--forest-panel` mantiene el acabado editorial de Enfoque y Confianza. |

`--surface-forest` sigue siendo el fondo de las secciones y paneles de marca. Los paginadores del hero y Testimonios usan papel sobre un fondo oscuro. Los de Centro de día y Recorrido usan iconos oscuros sobre vidrio claro.

Confianza y Centro de día muestran al pasar el puntero el mismo vidrio bosque con un reflejo fino. En Centro de día, los divisores se disuelven cuando aparece el vidrio y la selección se mantiene en crema con texto oscuro y un medallón bosque para el número.

La navegación de escritorio tiene una sola cápsula, alineada con el elemento que corresponde a `aria-current`. GSAP anima su posición y escala sin recalcular el mapa a cada cuadro. El hover de otro enlace muestra un contorno leve y el foco visible conserva su propio anillo. El desplegable tiene un centro más difuso para leer los enlaces sobre texto o fotos. El menú móvil indica la sección activa con un borde neutro.

En el hero, «Ver el recorrido» y «Desde 2009» comparten el tinte, el bisel y el desenfoque de `.liquid-glass--blur`. El botón usa el hover de `Cta.astro`. La franja de credenciales reúne cuatro valores en una superficie de vidrio crema. En pantallas amplias, su borde superior refracta el pie de la fotografía. En Testimonios, «Leer reseña» y «Cerrar reseña» comparten el vidrio claro de los controles secundarios.

En el FAQ, cada pregunta usa vidrio claro, el radio `--radius-card` y un contorno continuo con `--glass-divider`. El contorno enmarca la pregunta y su respuesta, también al pasar el puntero. El vidrio conserva el fundido de Confianza y el medallón cambia de `+` a `−` al abrir. El foco por teclado rodea toda la tarjeta. Cada columna conserva su grupo de `details`.

### Implementación y respaldo

- Las clases de superficie y los tokens de película, bisel y desenfoque viven en [global.css](src/styles/global.css). Usa `OpticalGlass` para los controles que necesiten curvar el fondo. Para las demás superficies, usa los acabados CSS de la tabla.
- En el hero, Recorrido y Comunidad, `OpticalGlass` filtra una copia decorativa alineada con la foto activa de `data-glass-scene` o con la imagen fija `data-glass-image`. CSS aporta el tinte y los reflejos. SVG desplaza los píxeles del borde con `feDisplacementMap`. Durante el fundido o el zoom inicial del hero se ve la foto en vivo bajo la película. [Especificación de filtros SVG](https://drafts.csswg.org/filter-effects-1/#feDisplacementMapElement).
- Para fondos variables, la cabecera y las credenciales usan el desenfoque CSS de `--optical-backdrop-blur`. En Chromium se mejora con un filtro SVG de fondo. El soporte de estos filtros varía según el motor. [Seguimiento en Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1961378) y [seguimiento en WebKit](https://bugs.webkit.org/show_bug.cgi?id=245510).
- [glass.ts](src/scripts/glass.ts) comparte los observadores de las escenas y agrupa los cambios antes de dibujar. Prepara las lentes hasta 120 px fuera del área visible. Al salir de ese margen, libera la copia y el filtro.
- [OpticalFilterDefinitions.astro](src/components/OpticalFilterDefinitions.astro) declara el filtro SVG una vez por página. [optical-filter.ts](src/scripts/optical-filter.ts) lo ajusta al tamaño de la lente y del área muestreada. Ahí se define la intensidad de refracción. La escarcha se mide en píxeles CSS. Las fotos toman su valor de `glass.ts` y la cabecera puede ajustarla con `--optical-frost`.
- [optical-map.ts](src/scripts/optical-map.ts) calcula la curva del borde y su reflejo con Canvas 2D. Genera el PNG en memoria cuando entra una geometría nueva y conserva hasta 48 mapas por tamaño, radio y densidad de píxel. La resolución del mapa llega hasta 2 píxeles por píxel CSS. WebKit vuelve a aplicar el filtro tras cargar el mapa para que repinte la imagen.
- [nav-glass.ts](src/scripts/nav-glass.ts) anima la cápsula con el GSAP existente. Con movimiento reducido la cápsula se coloca de inmediato. Con transparencia reducida o colores forzados, el adaptador libera filtros y copias y el CSS conserva la legibilidad. Los controles siguen siendo enlaces, botones y `summary` nativos.

### Verificación del vidrio

Usa `npm run check`, `npm run build` y `npm run preview` para revisar el resultado de producción. Compara capturas antes y después, con el mismo navegador, tamaño y escala de píxel. Revisa el hero al entrar y al cambiar de foto, la cápsula y el desplegable de escritorio, los rótulos de Recorrido y el botón de Comunidad. Activa transparencia reducida y comprueba que se retiren las capas ópticas. Al volver a una escena tras desplazarte, la refracción debe aparecer de nuevo.

El sello de primera visita mantiene el roble sólido. La esfera decorativa de Recorrido usa un degradado radial, un borde interior luminoso y una sombra suave. La tarjeta de talleres de arte conserva su fondo bosque y un medallón translúcido.

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
