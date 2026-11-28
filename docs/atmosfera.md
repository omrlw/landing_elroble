# Luz de fondo en El Roble

El hero abre con arcos de vidrio en ambos márgenes sobre una base crema cálida. En el resto de la landing reaparecen tramos de ese mismo material con curvaturas y encuadres distintos. Los arcos se colocan en los márgenes de cada composición. Sobre bosque, el trazo es más corto o menos intenso.

## Referencias

| Referencia | Aplicación en El Roble |
| --- | --- |
| Imágenes de concepto de El Roble | El vidrio aporta una diferencia suave de tono y relieve. Los reflejos del sitio retoman esa cualidad con trazos abiertos en los márgenes. |
| Daylight | La luz acompaña el relato. En Historia, el brillo cambia entre el margen izquierdo del retrato y el margen derecho del jardín. [Daylight en Awwwards](https://www.awwwards.com/sites/daylight) · [Caso de basement.studio](https://basement.studio/post/elevating-daylights-gtm-strategy) |
| 14islands | La luz del borde y la variación del tinte aportan volumen al vidrio. El shader de El Roble concentra este efecto en las superficies decorativas. [Caso de 14islands](https://tympanus.net/codrops/2023/10/10/progressively-enhanced-webgl-lens-refraction/) |

## Mapa de fondos

| Superficie | Forma y movimiento |
| --- | --- |
| Hero | Dos reflejos de la misma curvatura en los márgenes. El de la izquierda es más tenue. |
| Historia | En móvil, los arcos acompañan los títulos y el panel verde. En escritorio, el arco se sitúa a la izquierda del retrato y en la esquina inferior derecha del jardín. |
| Confianza y Centro de día | Reflejo corto apoyado en la esquina superior derecha de Confianza y barrido amplio a la derecha de Centro de día. |
| Enfoque y Testimonios | Curva ascendente en la esquina inferior derecha de Enfoque y trazo horizontal en la esquina superior izquierda de Testimonios. |
| Programa y Recorrido | Par de arcos junto al arte de Programa y reflejo ascendente cerca de la invitación de Recorrido. |
| Preguntas frecuentes, Comunidad y cierre | Reflejo abierto junto al encabezado de Preguntas en el margen derecho, arco doble a la derecha de Comunidad y un destello más bajo en el margen izquierdo del cierre. |

## Implementación y verificación

[AmbientLight.astro](../src/components/AmbientLight.astro) selecciona el perfil, el lado y el tono. La capa se ancla a los límites de la superficie de fondo. [ambient-light.ts](../src/scripts/ambient-light.ts) reutiliza hasta tres lienzos WebGL y rasteriza solo las franjas de cada bisel. Los lienzos se componen directamente en la sección visible. La animación se congela al ocultar la pestaña y los lienzos se liberan de la sección al salir de pantalla. [Prácticas de WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)

En una muestra de 2,1 segundos en la primera escena de Historia, las llamadas que copiaban un lienzo WebGL a uno 2D pasaron de 122 a 0 en Chrome a 1440 × 1000 y de 183 a 0 a 390 × 844. Se midió esa ruta de dibujo en la vista previa de producción.

En equipos sin WebGL, los mismos perfiles pasan a trazos SVG con destellos visibles. Con movimiento reducido quedan fijos y en colores forzados se ocultan. El hero conserva la pausa de su carrusel y, si WebGL falla, desplaza el brillo a través de una máscara CSS.

En `npm run preview`, revisar la intensidad del hero, los márgenes de Historia y el tamaño del reflejo en Confianza. Comprobar las capas de las fotografías, el movimiento en reposo y con scroll, y la alternativa sin WebGL.
