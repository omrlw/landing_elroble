# Sistema visual de El Roble

La landing del centro de día combina fotografía cotidiana, fondos cálidos y verde bosque. Cormorant Garamond da voz a los títulos. Google Sans Flex se usa para lectura, navegación y controles.

Los valores compartidos viven en [tokens.css](src/styles/tokens.css). [global.css](src/styles/global.css) carga los estilos del sitio y cada sección define su propia composición.

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

Los rangos corresponden a una raíz de 16 px. Los títulos usan Cormorant Garamond en peso 700. Los textos de lectura y controles usan Google Sans Flex. Las tres escenas de Historia usan `--text-section`. Los rótulos de Confianza, Centro de día y Preguntas frecuentes comparten tamaño e interlineado. Las llamadas a la acción del contenido tienen una altura mínima de 48 px en móvil y 60 px en los demás tamaños. La cabecera fija usa su variante compacta.

## Espaciado

| Relación | Token | Tamaño |
| --- | --- | --- |
| Detalles de un mismo elemento | `--space-detail` | 8 px |
| Título y descripción, texto y botón | `--space-related` | 12–20 px |
| Márgenes internos de tarjetas | `--space-inset` | 16–32 px |
| Encabezado y contenido, filas y grupos | `--section-gap` | 24–48 px |
| Transiciones amplias | `--space-section` | 40–76 px |

Los rangos corresponden a una raíz de 16 px. Programa y Recorrido comparten un solo intervalo amplio en su fondo continuo. Los cambios de fondo permiten acercar los grupos a ambos lados del borde. El hero y Confianza conservan el espaciado de su composición. Las fotos escalonadas de Centro de día, Recorrido y Comunidad mantienen sus desplazamientos. En Historia, `--story-travel` determina la distancia de scroll de la secuencia fija. Los márgenes y separaciones de las escenas controlan el espacio visible.

Las filas de selección de Confianza y Centro de día en pantallas amplias usan una altura mínima de 52 px (`--control-row-min-height`). En móvil, Preguntas frecuentes usa ese mismo mínimo para el encabezado de cada tarjeta y deja 4 px entre tarjetas. A partir de 640 px, el mínimo adaptable es de 68 a 80 px, con una separación de 12 a 16 px. Las dos columnas se expanden de forma independiente. La lectura y el foco recorren cada columna de arriba abajo.

`--control-size` da a los controles compactos una medida base de 44 px con una raíz de 16 px. `--space-control-gap` mantiene una separación fija de 12 px donde los controles la necesitan. `--radius-pill` se usa en botones, cápsulas y paginadores.

Centro de día abre con `--space-section`, igual que Programa. Usa ese mismo intervalo completo entre su último grupo y el panel verde de Enfoque. Entre Programa y Recorrido, el espacio visible se reparte entre las dos secciones.

### Composición móvil

Por debajo de 40 rem, la escala se fija en 8 px para detalles, 12 px entre elementos relacionados, 16 px para rellenos y márgenes de página, 24 px entre grupos y 40 px entre secciones en un fondo continuo. Confianza y Enfoque tienen un margen exterior de 8 px. Su contenido se alinea a 16 px del borde de la pantalla, igual que el resto de la página. El fondo de Testimonios llega a ambos bordes de la pantalla.

El titular del hero usa `--text-hero` de 44 a 60 px en móvil. La introducción sigue al titular con `--space-related`. El sello de primera visita parte de la esquina superior de la foto. En ventanas de menos de 40 rem de alto, parte del lado izquierdo para separarse de WhatsApp. Al avanzar por la página, la promoción se acopla dentro de la cabecera móvil para dejar los títulos libres.

Enfoque deja libre el ancho del título por debajo de 23.5 rem. En Testimonios, las tarjetas ocupan hasta un 88% del carrusel y dejan visible el borde de la siguiente reseña. La reseña más larga marca la altura de la fila.

| Formato | Token | Uso en móvil |
| --- | --- | --- |
| 9:10 | `--photo-ratio-portrait` | Hero, Historia, retrato de Enfoque y Recorrido |
| 5:4 | `--photo-ratio-gallery` | Confianza, actividades de Centro de día y vista previa de Comunidad |
| 16:9 | `--photo-ratio-landscape` | Tarjetas de Programa y fotos secundarias de Centro de día |

Los marcos comparten `--photo-radius` donde la composición admite el mismo contorno. Cada fotografía conserva su punto de encuadre. En Historia, el marco se acorta si el texto de una escena necesita más espacio en la ventana. La escena final reúne el título, la foto y la invitación en un panel verde con el margen exterior de `--page-gutter` y el relleno de `--space-inset`. El alto del panel lo define su contenido.

Confianza y Centro de día muestran un solo rótulo con su descripción bajo el paginador. Las filas se superponen para que la descripción más larga defina la altura del panel. Al elegir un punto, deslizar una foto o dejar correr el carrusel, el texto entra a mitad del fundido de la imagen correspondiente. Con movimiento reducido, ambos cambian a la vez y la reproducción automática se detiene. En Confianza, la invitación móvil conserva el titular y el botón.

## Paleta

| Función | Tokens |
| --- | --- |
| Fondo general | `--color-cream` (`#f4f1ec`), continuo en todo el landing. La cabecera y la escena clara de Historia parten del mismo crema. |
| Tarjetas y lectura sobre claro | `--color-paper` (`#fcfaf5`) y `--surface-paper` |
| Vidrio claro | `--glass-clear-tint`, de `--color-cream` sólido a 77% de opacidad. |
| Títulos y texto | `--color-ink` (`#142013`) y `--color-text` (`#3d3935`) |
| Secciones y paneles verdes | `--surface-forest`, un degradado vertical desde el verde de acción mezclado con crema hasta `--color-forest`. |
| Acciones principales | `--surface-action`, de `--color-action` (`#2b4027`) a bosque |
| Acentos de roble | `--color-oak` (`#532d12`) en titulares, `--color-oak-highlight` (`#8a541f`) en la promoción y `--color-honey` (`#e8d7b9`) en detalles cálidos |

Usa `--color-paper` o `--color-cream` para texto principal sobre bosque y `--color-on-forest-muted` para texto secundario. Los paneles dentro de una sección verde pueden usar `--surface-on-forest`.

## Iconos de acción

[ActionIcon.astro](src/components/ActionIcon.astro) concentra los trazados en una cuadrícula de 20 unidades con un trazo de 1,5, extremos y uniones redondeados. El icono toma el color de su control. El enlace o botón aporta el nombre accesible.

| Icono | Tamaño | Uso |
| --- | --- | --- |
| Flecha derecha | 16 px | Llamadas a la acción del contenido |
| WhatsApp | 16, 20 y 38 px | Botón «Agendar una visita» en la cabecera y el menú lateral. Bajo 40 rem, el botón circular de 68 px se fija abajo a la derecha con un fondo bosque y bisel de vidrio. |
| Flecha diagonal | 16 px | Enlace a publicaciones en TikTok |
| Más y menos | 16 px | Filas desplegables de Confianza y Preguntas frecuentes, con medallón de 28 px |
| Chevrón | 14 px | Abrir y cerrar «Nosotros» en la navegación |
| Menú y cerrar | 20 px | Abrir y cerrar la navegación móvil |
| Cerrar promoción | 16 px | Medallón de vidrio claro de 28 px con área táctil de 44 px |
| Reproducir y pausar | 14 px | Controles de reproducción automática de los carruseles |
| Reproducir | 24 px | Vistas previas de Comunidad |
| Teléfono | 16 y 20 px | Barra de cabecera compacta, menú móvil y contacto |
| Reloj, ubicación y correo | 20 px | Horario en el menú y enlaces de contacto |

Los puntos y las cápsulas de paginación indican la posición en el carrusel y usan `data-gallery-mark`. Sus dimensiones y estados están en [gallery.css](src/styles/gallery.css).

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
- La hoja del hero nace junto al final del título.
- Historia usa bellotas, una rama y una hoja de roble sobre vidrio claro o bosque encima de los tres títulos en móvil. A partir de 40 rem, las bellotas y la rama se colocan debajo del texto de las dos escenas claras.
- Enfoque y Recorrido usan la ramita original de «Genial». En Enfoque queda reducida y con aire alrededor. Programa combina la rama izquierda original con un brote nuevo a la derecha en escritorio. Entre 40 y 48 rem, el brote acompaña la transición al Recorrido.
- Preguntas frecuentes tiene una ramita en el encabezado y, desde 40 rem, una bellota de «Genial» junto a la invitación para agendar una visita. Comunidad usa el roble de «Genial» encima del título.

## Luz de fondo

[hero-light.ts](src/scripts/hero-light.ts) dibuja el mismo arco abierto de vidrio en los dos márgenes del hero. El reflejo izquierdo tiene menos intensidad. La luz recorre el bisel que reaparece en Historia, con una sombra suave. El cursor modula el reflejo en escritorio. El botón de pausa del carrusel detiene también la luz del hero.

[AmbientLight.astro](src/components/AmbientLight.astro) reutiliza el bisel del hero en arcos abiertos. Cambian de tamaño, lado y altura según el espacio libre de cada sección. Sobre bosque, el brillo tiene menos intensidad. Historia usa el mismo arco y la misma escala en sus escenas, con el retrato a la izquierda y el jardín en la esquina inferior derecha. La capa queda detrás de las fotos y los controles. Ancla la decoración a la superficie de la sección con `position: relative` e `isolation: isolate`.

La luz recorre el bisel en reposo y el scroll modula su fase. En Historia móvil, el arco acompaña los títulos de las escenas claras y recorre el interior del panel verde. En ausencia de WebGL, el destello viaja sobre un trazo SVG. Con movimiento reducido el reflejo queda fijo y en colores forzados se oculta. El mapa de fondos y las referencias están en [docs/atmosfera.md](docs/atmosfera.md).

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

En el hero, «Ver el recorrido» y «Desde 2009» comparten el tinte, el bisel y el desenfoque de `.liquid-glass--blur`. La tarjeta usa ese acabado en todos los tamaños y su encabezado se compacta en móvil. El botón usa el hover de `Cta.astro`. La franja de credenciales reúne cuatro valores en una sola fila de vidrio crema. En móvil se desplaza en bucle. Con movimiento reducido queda quieta y admite desplazamiento manual. En pantallas más anchas se muestran las cuatro credenciales en una fila fija. En pantallas amplias, su borde superior refracta el pie de la fotografía. En Testimonios, «Leer reseña» y «Cerrar reseña» comparten el vidrio claro de los controles secundarios.

En el FAQ, cada pregunta usa vidrio claro, el radio `--radius-card` y un contorno continuo con `--glass-divider`. El contorno enmarca la pregunta y su respuesta, también al pasar el puntero. El vidrio conserva el fundido de Confianza y el medallón cambia de `+` a `−` al abrir. El foco por teclado rodea toda la tarjeta. Cada columna conserva su grupo de `details`.

### Implementación y respaldo

- Las clases de superficie viven en [glass.css](src/styles/glass.css) y los valores de película, bisel y desenfoque en [tokens.css](src/styles/tokens.css). Usa `OpticalGlass` para los controles que necesiten curvar el fondo. Para las demás superficies, usa los acabados CSS de la tabla.
- En Recorrido y Comunidad, `OpticalGlass` filtra una copia decorativa alineada con la imagen de `data-glass-image` dentro de `data-glass-scene`. CSS aporta el tinte y los reflejos. SVG desplaza los píxeles del borde con `feDisplacementMap`. [Especificación de filtros SVG](https://drafts.csswg.org/filter-effects-1/#feDisplacementMapElement).
- Para fondos variables, la cabecera y las credenciales usan el desenfoque CSS de `--optical-backdrop-blur`. En Chromium se mejora con un filtro SVG de fondo. El soporte de estos filtros varía según el motor. [Seguimiento en Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1961378) y [seguimiento en WebKit](https://bugs.webkit.org/show_bug.cgi?id=245510).
- [glass.ts](src/scripts/glass.ts) comparte los observadores de las escenas y agrupa los cambios antes de dibujar. Prepara las lentes hasta 120 px fuera del área visible. Al salir de ese margen, libera la copia y el filtro.
- [OpticalFilterDefinitions.astro](src/components/OpticalFilterDefinitions.astro) declara el filtro SVG una vez por página. [optical-filter.ts](src/scripts/optical-filter.ts) lo ajusta al tamaño de la lente y del área muestreada. Ahí se define la intensidad de refracción. La escarcha se mide en píxeles CSS. Las fotos toman su valor de `glass.ts` y la cabecera puede ajustarla con `--optical-frost`.
- [optical-map.ts](src/scripts/optical-map.ts) calcula la curva del borde y su reflejo con Canvas 2D. Genera el PNG en memoria cuando entra una geometría nueva y conserva hasta 48 mapas por tamaño, radio y densidad de píxel. La resolución del mapa llega hasta 2 píxeles por píxel CSS. WebKit vuelve a aplicar el filtro tras cargar el mapa para que repinte la imagen.
- [nav-glass.ts](src/scripts/nav-glass.ts) anima la cápsula con el GSAP existente. Con movimiento reducido la cápsula se coloca de inmediato. Con transparencia reducida o colores forzados, el adaptador libera filtros y copias y el CSS conserva la legibilidad. Los controles siguen siendo enlaces, botones y `summary` nativos.

### Verificación del vidrio

Usa `npm run check`, `npm run build` y `npm run preview` para revisar el resultado de producción. Compara capturas antes y después, con el mismo navegador, tamaño y escala de píxel. Revisa el hero al entrar y al cambiar de foto, la cápsula y el desplegable de escritorio, los rótulos de Recorrido y el botón de Comunidad. Activa transparencia reducida y comprueba que se retiren las capas ópticas. Al volver a una escena tras desplazarte, la refracción debe aparecer de nuevo.

El sello de primera visita tiene una superficie roble, la ramita «Margen izquierdo» de Genial en el borde superior izquierdo y un cierre circular en vidrio claro. «Gratis» lleva la tipografía de títulos en cursiva. El sello parte de su posición en la portada y, a partir de 40 rem, se acopla debajo de la cabecera al deslizar. La ramita se mueve brevemente cada doce segundos y respeta la preferencia de movimiento reducido. La tarjeta de talleres de arte conserva su fondo bosque y un medallón translúcido.

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
- El menú móvil y de tablet se desliza desde el borde derecho con GSAP. La entrada comparte la duración y la curva de desaceleración de las imágenes del carrusel. La X gira al aparecer y al cerrar, y el icono de menú vuelve al terminar la salida. Con movimiento reducido, el panel abre y cierra de inmediato.
- En teléfonos en vertical con al menos 44 rem de altura, Historia reutiliza la línea de tiempo fijada con texto y foto en una columna. El detalle de las manos abre el relato y las fotos del jardín y del bingo se revelan con el scroll. En teléfonos más bajos, las tres escenas siguen el flujo normal y se animan al entrar en pantalla. Con movimiento reducido, el relato queda en el flujo normal con sus enlaces y acciones.
